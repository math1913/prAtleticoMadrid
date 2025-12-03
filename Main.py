import requests
from requests.auth import HTTPDigestAuth
import json
import re
import write_xml as w
import time
DEVICE_IP = "192.168.1.66"
USERNAME = "admin"
PASSWORD = "IloveAdmira!"
URL = f"http://{DEVICE_IP}/ISAPI/Event/notification/alertStream"
# URL2 = f"http://{DEVICE_IP}/ISAPI/AccessControl/UserInfo/Search?format=json"

BOUNDARY = b"--MIME_boundary"

# def buscar_user_fechainicio(employee_no):

#     payload = {
#         "UserInfoSearchCond": {
#             "searchID": "1",
#             "searchResultPosition": 0,
#             "maxResults": 1,
#             "EmployeeNoList": [
#                 {"employeeNo": employee_no}
#             ]
#         }
#     }

#     # JSON crudo
#     data_raw = json.dumps(payload)

#     headers = {
#         "Content-Type": "application/json"
#     }

#     # SESSION para mantener el digest nonce
#     session = requests.Session()
#     session.auth = HTTPDigestAuth(USERNAME, PASSWORD)

#     # --------
#     # 1. Primer POST (sin cuerpo, igual que curl)
#     # --------
#     r1 = session.post(URL, headers=headers, data=None)

#     print("Primer POST:", r1.status_code)

#     # --------
#     # 2. Segundo POST (con el cuerpo JSON, digest firmado)
#     # --------
#     r2 = session.post(URL, headers=headers, data=data_raw)

#     print("Segundo POST:", r2.status_code)
#     print("Respuesta:\n", r2.text)

#     if r2.status_code == 200:
#         data = r2.json()
#         user = data["UserInfoSearch"]["UserInfo"][0]
#         return user["Valid"]["beginTime"]


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
    w.writeValor(str(ace.get("employeeNoString")))
    
    with open("HIKVISION.txt", "w") as f:
        f.write(str(ace.get("name")).upper())

    print("========== TARJETA DETECTADA ==========")
    print("CardNo:", ace.get("cardNo"))
    print("Usuario:", ace.get("name"))
    print("EmployeeNo:", ace.get("employeeNoString"))
    print("Fecha:", data.get("dateTime"))
    print("majorEventType:", ace.get("majorEventType"))
    print("subEventType:", ace.get("subEventType"))
    # print("Fecha inicio:", buscar_user_fechainicio(ace.get("employeeNoString")))
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
