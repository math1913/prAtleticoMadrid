from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Permite que React haga fetch desde otro puerto

@app.route("/name")
def get_name():
    with open("HIKVISION.txt", "r", encoding="utf-8") as f:
        return f.read()

if __name__ == "__main__":
    app.run(port=5000)
