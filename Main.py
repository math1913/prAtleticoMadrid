import requests
from requests.auth import HTTPDigestAuth
import json
import re
import write_xml as w
import time
import subprocess
DEVICE_IP = "192.168.1.66"
USERNAME = "admin"
PASSWORD = "IloveAdmira!"
URL = f"http://{DEVICE_IP}/ISAPI/Event/notification/alertStream"
# URL2 = f"http://{DEVICE_IP}/ISAPI/AccessControl/UserInfo/Search?format=json"

BOUNDARY = b"--MIME_boundary"

def buscar_user_fechainicio(employee_no):

    cmd = [
        "curl",
        "--silent",
        "--digest",
        "-u", f"{USERNAME}:{PASSWORD}",
        "-H", "Content-Type: application/json",
        "-X", "POST",
        "-d", f'''{{
            "UserInfoSearchCond": {{
                "searchID": "1",
                "searchResultPosition": 0,
                "maxResults": 1,
                "EmployeeNoList": [
                    {{ "employeeNo": "{employee_no}" }}
                ]
            }}
        }}''',
        f"http://{DEVICE_IP}/ISAPI/AccessControl/UserInfo/Search?format=json"
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    output = result.stdout

    print("Respuesta cruda:")
    print(output)

    try:
        data = json.loads(output)
        user = data["UserInfoSearch"]["UserInfo"][0]
        print("\nFecha inicio:", user["Valid"]["beginTime"])
        print("Nombre:", user["name"])
    except Exception as e:
        print("ERROR interpretando JSON:", e)
        
    with open("HIKVISION.txt", "w") as f:
        f.write(f"{user["name"].upper()} {user["Valid"]["beginTime"][0:4]}")


def process_part(part_bytes):
    """Procesa un bloque completo de MIME (bytes)"""
    try:
        text = part_bytes.decode("utf-8", errors="ignore")
    except:
        return

    # Extraer JSON con regex tolerante
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        return

    json_text = match.group(0)

    try:
        data = json.loads(json_text)
    except:
        return  # JSON corrupto → ignorar

    # Filtrar solo AccessControllerEvent con tarjeta
    if data.get("eventType") != "AccessControllerEvent":
        return

    ace = data.get("AccessControllerEvent", {})
    if "cardNo" not in ace:
        return

    # Mostrar resultado
    #w.writeValor(str(ace.get("employeeNoString")))
    


    print("========== TARJETA DETECTADA ==========")
    print("CardNo:", ace.get("cardNo"))
    print("Usuario:", ace.get("name"))
    print("EmployeeNo:", ace.get("employeeNoString"))
    print("Fecha:", data.get("dateTime"))
    print("majorEventType:", ace.get("majorEventType"))
    print("subEventType:", ace.get("subEventType"))
    print("Fecha inicio:", buscar_user_fechainicio(ace.get("employeeNoString")))
    print("========================================\n")

    time.sleep(5)
    with open("HIKVISION.txt", "w") as f:
        f.write("ATLETI")

def main():
    print("Conectando al stream de Hikvision...\n")

    # Stream de bytes crudos
    with requests.get(
        URL,
        auth=requests.auth.HTTPDigestAuth(USERNAME, PASSWORD),
        stream=True
        
    ) as r:
        
        buffer = b""

        for chunk in r.iter_content(chunk_size=1024):
            if not chunk:
                continue

            buffer += chunk
            
            # Buscar boundaries completos
            while True:
                idx = buffer.find(BOUNDARY)
                if idx == -1:
                    break

                # Buscar siguiente boundary
                next_idx = buffer.find(BOUNDARY, idx + len(BOUNDARY))
                if next_idx == -1:
                    break  # todavía no ha llegado completo

                part = buffer[idx:next_idx]
                process_part(part)

                # Reducir buffer
                buffer = buffer[next_idx:]


if __name__ == "__main__":
    main()
