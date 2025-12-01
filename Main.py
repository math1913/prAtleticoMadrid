from pynput import keyboard
import time

buffer = ""

def on_press(key):
    global buffer
    
    try:
        # Letras y números
        buffer += key.char
    except AttributeError:
        # Teclas especiales
        if key == keyboard.Key.enter:
            print("Código escaneado:", buffer)

            with open("HIKVISION.txt", "w") as f:
                f.write(buffer)

            buffer = ""  # Reiniciar para el siguiente código

            time.sleep(5)

            with open("HIKVISION.txt", "w") as f:
                f.write('ATLETI')
        
        

def on_release(key):
    pass  # No necesitamos manejar eventos de soltar tecla

with keyboard.Listener(on_press=on_press, on_release=on_release) as listener:
    listener.join()