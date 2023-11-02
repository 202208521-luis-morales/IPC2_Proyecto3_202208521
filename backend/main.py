from flask import Flask

app = Flask(__name__)

# ver dataStructure.js para ver como se distribuye la estructura
data = {
  "messages": [],
  "dictionary": {
    "positives": [],
    "negatives": []
  }
}

@app.route("/reset")
def reset():
    return "<p>Reset Works!</p>"

@app.route("/loadMessages", methods=["POST"])
def load_messages():
    return "<p>Load Messages Works!</p>"

@app.route("/loadConfig", methods=["POST"])
def load_config():
    return "<p>Load Config Works!</p>"

@app.route("/consult")
def consult():
    return "<p>Consult Works!</p>"