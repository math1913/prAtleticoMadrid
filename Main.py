import requests
import json
import re
import write_xml as w
DEVICE_IP = "192.168.1.67"
USERNAME = "admin"
PASSWORD = "IloveAdmira!"
URL = f"http://{DEVICE_IP}/ISAPI/Event/notification/alertStream"

BOUNDARY = b"--MIME_boundary"

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
    print("========== TARJETA DETECTADA ==========")
    print("CardNo:", ace.get("cardNo"))
    print("Usuario:", ace.get("name"))
    print("EmployeeNo:", ace.get("employeeNoString"))
    print("Fecha:", data.get("dateTime"))
    print("majorEventType:", ace.get("majorEventType"))
    print("subEventType:", ace.get("subEventType"))
    print("========================================\n")


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
