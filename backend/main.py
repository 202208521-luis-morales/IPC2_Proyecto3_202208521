from flask import Flask, request, Response
from flask_cors import CORS
import xml.etree.ElementTree as ET
import re
from operator import itemgetter
from itertools import groupby
from datetime import datetime

import unidecode

app = Flask(__name__)
CORS(app)

# ver dataStructure.js para ver como se distribuye la estructura
dbData = {
  "messages": [],
  "dictionary": {
    "positives": [],
    "negatives": []
  }
}

@app.route("/reset")
def reset():
    return "<p>Reset Works!</p>"

@app.route("/getConfig")
def get_messages():
    root = ET.Element("CONFIG_RECIBIDA")
    ET.SubElement(root, "PALABRAS_POSITIVAS").text = dbData["dictionary"]["positives"]
    ET.SubElement(root, "PALABRAS_POSITIVAS_RECHAZADAS").text = "0"
    ET.SubElement(root, "PALABRAS_NEGATIVAS").text = dbData["dictionary"]["negatives"]
    ET.SubElement(root, "PALABRAS_NEGATIVAS_RECHAZADAS").text = "0"

    xml_string = ET.tostring(root, encoding='utf8').decode('utf8')
    return Response(xml_string, content_type='application/xml')

@app.route("/getMessages")
def get_messages():
    # Generar la lista para insertarla en el .xml
    dbData["messages"].sort(key=itemgetter('date'))

    result = []
    for date, group in groupby(dbData["messages"], key=itemgetter('date')):
        message_group = list(group)
        texts = [message['text'] for message in message_group]
        result.append({'date': date, 'texts': texts})

    print(result)

    root = ET.Element("MENSAJES_RECIBIDOS")

    for time in result:
        tiempo = ET.SubElement(root, "TIEMPO")
        texts = time["texts"]

        ET.SubElement(tiempo, "FECHA").text = tiempo["date"]
        ET.SubElement(tiempo, "MSJ_RECIBIDOS").text = len(texts)
        ET.SubElement(tiempo, "USR_MENCIONADOS").text = encontrar_menciones(".".join(texts))
        ET.SubElement(tiempo, "HASH_INCLUIDOS").text = encontrar_hashtags(".".join(texts))

    xml_string = ET.tostring(root, encoding='utf8').decode('utf8')
    return Response(xml_string, content_type='application/xml')

@app.route("/loadMessages", methods=["POST"])
def load_messages():
    file = request.files['file']

    if file and file.filename.endswith('.xml'):
        xml_data = file.read()
        root = ET.fromstring(xml_data)

        for indx, mensaje in enumerate(root.findall("MENSAJE")):
            patron_fecha = r'\d{2}/\d{2}/\d{4}'

            match = re.search(patron_fecha, mensaje.find("FECHA").text)

            if match:
                fecha = match.group(0)
                dbData["messages"].append({"date": fecha, "text": mensaje.find("TEXTO").text.strip()})

                print(dbData)
            else:
                return f'No se encontró ninguna fecha dentro del mensaje {indx}', 400
            
        return 'Archivo XML cargado y procesado exitosamente', 200

    return 'Sólo se aceptan archivos .xml', 400

@app.route("/loadConfig", methods=["POST"])
def load_config():
    file = request.files['file']

    if file and file.filename.endswith('.xml'):
        xml_data = file.read()
        root = ET.fromstring(xml_data)

        for palabra in root.find("sentimientos_positivos").findall("palabra"):
            dbData["dictionary"]["positives"].append(palabra.text.strip())

            print(dbData)

        for palabra in root.find("sentimientos_negativos").findall("palabra"):
            dbData["dictionary"]["negatives"].append(palabra.text.strip())

            print(dbData)
        
        return 'Archivo XML cargado y procesado exitosamente', 200

    return 'Sólo se aceptan archivos .xml', 400

@app.route("/consult")
def consult():
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    type_consult = request.args.get('type_consult')

    # Generar la lista para insertarla en el .xml
    dbData["messages"].sort(key=itemgetter('date'))

    result = []
    for date, group in groupby(dbData["messages"], key=itemgetter('date')):
        message_group = list(group)
        texts = [message['text'] for message in message_group]
        result.append({'date': date, 'texts': texts})

    print(result)

    if type_consult == "hashtags":
        return contar_hashtags(result, start_date, end_date), 200
    elif type_consult == "mentions":
        return contar_menciones_usuarios(result, start_date, end_date), 200
    elif type_consult == "feelings":
        return contar_sentimientos_palabras(result, start_date, end_date), 200
    elif type_consult == "graphs":
        return {"hashtags": contar_hashtags(result, start_date, end_date), "mentions": contar_menciones_usuarios(result), "feelings": contar_sentimientos_palabras(result, start_date, end_date)}, 200

    return "Error: Ninguno de los tipos enviados concuerda con alguno de los tipos programados", 400

def encontrar_menciones(texto):
    # Utiliza una expresión regular para encontrar menciones de usuarios
    menciones = re.findall(r'@[\wáéíóúÁÉÍÓÚüÜ]+', texto)
    
    # Normaliza las menciones para no distinguir mayúsculas y acentos
    menciones_normalizadas = [unidecode(mencion.lower()) for mencion in menciones]
    
    # Utiliza un conjunto (set) para eliminar menciones duplicadas
    menciones_unicas = set(menciones_normalizadas)
    
    return len(menciones_unicas)

def encontrar_hashtags(texto):
    hashtags = re.findall(r'#(.*?)#', texto)
    
    hashtags_normalizados = [unidecode(hashtag.lower()) for hashtag in hashtags]

    hashtags_unicos = set(hashtags_normalizados)
    
    return len(hashtags_unicos)

def contar_hashtags(lista_datos, start_date, end_date):
    return [{"date": ld["date"], "list": _contar_hashtags(".".join(ld["texts"]))} for ld in lista_datos if datetime.strptime(start_date, "%Y-%m-%d") <= datetime.strptime(ld["date"], "%Y-%m-%d") <= datetime.strptime(end_date, "%Y-%m-%d")]

def _contar_hashtags(texto):
     # Utiliza una expresión regular para encontrar hashtags dentro de #...#
    hashtags = re.findall(r'#(.*?)#', texto)
    
    # Normaliza los hashtags para no distinguir mayúsculas, minúsculas y acentos
    hashtags_normalizados = [unidecode(hashtag.lower()) for hashtag in hashtags]
    
    # Cuenta la frecuencia de cada hashtag
    conteo_hashtags = {}
    for hashtag in hashtags_normalizados:
        conteo_hashtags[hashtag] = conteo_hashtags.get(hashtag, 0) + 1
    
    return conteo_hashtags

def contar_sentimientos_palabras(lista_datos, start_date, end_date):
    return [{"date": ld["date"], "list": _contar_sentimientos_palabras(ld["texts"])} for ld in lista_datos if datetime.strptime(start_date, "%Y-%m-%d") <= datetime.strptime(ld["date"], "%Y-%m-%d") <= datetime.strptime(end_date, "%Y-%m-%d")]

def _contar_sentimientos_palabras(lista_textos):
    counter = {
        "positives": 0,
        "negatives": 0,
        "neutral": 0
    }

    temp_counter = 0

    for text in lista_textos:
        for pos in dbData["dictionary"]["positives"]:
            if pos in text:
                temp_counter += 1
        
        for neg in dbData["dictionary"]["negatives"]:
            if neg in text:
                temp_counter -= 1

        if temp_counter > 0:
            counter["positives"] += 1
        elif temp_counter < 0:
            counter["negatives"] += 1
        else:
            counter["neutral"] += 1

        temp_counter = 0
    
    return counter

def contar_menciones_usuarios(lista_datos, start_date, end_date):
    return [{"date": ld["date"], "list": _contar_menciones_usuarios(".".join(ld["texts"]))} for ld in lista_datos if datetime.strptime(start_date, "%Y-%m-%d") <= datetime.strptime(ld["date"], "%Y-%m-%d") <= datetime.strptime(end_date, "%Y-%m-%d")]

def _contar_menciones_usuarios(texto):
    # Utiliza una expresión regular para encontrar menciones de usuarios
    menciones = re.findall(r'@[\wáéíóúÁÉÍÓÚüÜ]+', texto)
    
    # Normaliza las menciones para no distinguir mayúsculas, minúsculas y acentos
    menciones_normalizadas = [unidecode(mencion.lower()) for mencion in menciones]
    
    # Cuenta la frecuencia de cada mención de usuario
    conteo_menciones = {}
    for mencion in menciones_normalizadas:
        conteo_menciones[mencion] = conteo_menciones.get(mencion, 0) + 1
    
    return conteo_menciones