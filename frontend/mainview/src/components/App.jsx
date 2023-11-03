import React, { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import Chart from "chart.js/auto";
import axios from 'axios';
import {format as prettyFormat} from 'pretty-format';

export default function App() {
  const chartRef1 = useRef(null);
  const chartRef2 = useRef(null);
  const chartRef3 = useRef(null);

  const [typeConsult, setTypeConsult] = useState("hashtags");
  const [textConsultPanel, setTextConsultPanel] = useState("Bienvenido: Realiza tu consulta");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [messagesFile, setMessagesFile] = useState(null);
  const [configFile, setConfigFile] = useState(null);
  const [dataForGraphs, setDataForGraphs] = useState({});

  function processResponse(res, isError = false) {
    console.log(res);
    if (isError) {
      Swal.fire("Error", res.response.data, "error");
    } else {
      Swal.fire("Éxito", res.data, "success");
    }
  }

  const onMessageFileChange = (event) => {
    event.preventDefault();
    setMessagesFile(event.target.files[0]);
  }

  const onInfoStudentButtonClicked = (event) => {
    Swal.fire({
      title: "Información del estudiante",
      html: '<div style="text-align: left; margin-left: 50px"><p>Nombre: Luis Rodrigo Morales Florián</p><p>Carnet: 202208521</p></div>',
      icon: 'info',
    });
  }

  const onConfigFileChange = (event) => {
    event.preventDefault();
    setConfigFile(event.target.files[0]);
  }

  const onResetButtonClicked = async (event) => {
    try {
      let res = await axios.post('http://127.0.0.1:5000/reset');
      processResponse(res);
    } catch (error) {
      processResponse(error, true);
    }
  }

  const handleConfigFileUpload = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("file", configFile);

    try {
      let res = await axios.post('http://127.0.0.1:5000/loadConfig', formData);
      processResponse(res);
    } catch (error) {
      processResponse(error, true);
    }
  }

  const handleMessageGet = (event) => {
    fetch('http://127.0.0.1:5000/getMessages')
      .then(response => response.text())
      .then(xml => {
        const blob = new Blob([xml], { type: 'application/xml' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'resumen_mensajes.xml';
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch(error => console.error(error));
  }

  const handleConfigGet = (event) => {
    fetch('http://127.0.0.1:5000/getConfig')
      .then(response => response.text())
      .then(xml => {
        const blob = new Blob([xml], { type: 'application/xml' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'resumen_configuracion.xml';
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch(error => console.error(error));
  }

  const handleMessageFileUpload = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("file", messagesFile);

    try {
      let res = await axios.post('http://127.0.0.1:5000/loadMessages', formData);
      processResponse(res);
    } catch (error) {
      processResponse(error, true);
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    let res = await axios.get(`http://127.0.0.1:5000/consult?start_date=${startDate}&end_date=${endDate}&type_consult=${typeConsult}`);
    
    if(typeConsult !== "graphs") {
      setDataForGraphs({});
      setTextConsultPanel(prettyFormat(res.data));
    } else {
      setDataForGraphs(res);
    }
    
  }

  useEffect(() => {
    /*
    const ctx = chartRef1.current.getContext("2d");
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: dataForGraphs.map((dat) => dat.date),
        datasets: [
          {
            label: "Hashtags",
            data: [12, 19, 3, 5, 2],
            borderWith: 1
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
    */
  }, [dataForGraphs]);
  

  return (
    <>
      <nav className="navbar bg-primary">
        <div className="container">
          <span className="navbar-brand mb-0 h1">Proyecto 3 | 202208521</span>
        </div>
      </nav>
      <main className="container mt-4 mb-5">
        <div className="card mt-4">
          <div className="card-header">Opciones</div>
          <div className="card-body row">
            <div className="col">
              <button onClick={onResetButtonClicked} className="btn btn-primary">Resetear datos</button>
            </div>
            <form onSubmit={(e) => handleMessageFileUpload(e)} className="col">
              <div className="form-group">
                <h5>Cargar archivo de mensajes:</h5>
                <input
                  required
                  type="file"
                  className="custom-file-input2 btn btn-secondary"
                  id="myFileInput"
                  onChange={(e) => onMessageFileChange(e)}
                  accept=".xml"
                />
              </div>
              <div>
                <button type="submit" className="btn btn-primary">Cargar</button>
                <button type="button" className="btn btn-success" onClick={handleMessageGet} style={{marginLeft: 10}}>Obtener resumen</button>
              </div>
            </form>

            <form onSubmit={(e) => handleConfigFileUpload(e)} className="col">
              <div className="form-group">
                <h5>Cargar archivo de configuración:</h5>
                <input
                  className="custom-file-input2 btn btn-secondary"
                  type="file"
                  name="load-config"
                  id="load-config"
                  onChange={(e) => onConfigFileChange(e)}
                  accept=".xml"
                />
              </div>
              <div>
                <button type="submit" className="btn btn-primary">Cargar</button>
                <button type="button" className="btn btn-success" onClick={handleConfigGet} style={{marginLeft: 10}}>Obtener resumen</button>
              </div>
            </form>
          </div>
        </div>

        <div className="card mt-4">
          <div className="card-header">Peticiones</div>
          <div className="card-body row">
            <form onSubmit={handleSubmit} className="col">
              <div className="form-group">
                <h6>Consultar:</h6>
                <select value={typeConsult} onChange={(e) => setTypeConsult(e.target.value)} className="form-control" style={{ width: "250px" }}>
                  <option value="hashtags">Hashtags</option>
                  <option value="mentions">Menciones</option>
                  <option value="feelings">Sentimientos en menciones</option>
                  <option value="graphs">Gráficas</option>
                </select>
              </div>
              <div className="form-group">
                <h6>Rango de fechas:</h6>
                <div className="d-flex align-items-center">
                  <input
                    type="date"
                    className="form-control"
                    style={{ width: "175px" }}
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                  <span className="mx-2"> - </span>
                  <input
                    type="date"
                    className="form-control"
                    style={{ width: "175px" }}
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <button type="submit" className="btn btn-primary">Consultar</button>
              </div>
            </form>
            <div className="col">
              <div>
                <h6>Resultado</h6>
                <textarea
                  disabled
                  value={textConsultPanel}
                  onChange={setTextConsultPanel}
                  rows="14"
                  className="form-control overflow-y-auto textarea-code"
                  style={{
                    backgroundColor: "#000",
                    resize: "none",
                    color: "#ddd",
                  }}
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <div className="card mt-4">
          <div className="card-header">Gráficas</div>
          <div className="card-body">
            Selecciona "Gráficas" en Consultar para ver las gráficas.
            { true ? <></>: 
            (<>
              <div className="p-3 rounded" style={{backgroundColor: "#eee"}}>
                <canvas ref={chartRef1} />
              </div>
              <div className="p-3 rounded" style={{backgroundColor: "#eee"}}>
                <canvas ref={chartRef2} />
              </div>
              <div className="p-3 rounded" style={{backgroundColor: "#eee"}}>
                <canvas ref={chartRef3} />
              </div>
            </>
            )}
          </div>
        </div>

        <div className="mt-4">
          <h3>
            <i className="fa-regular fa-circle-question"></i> Ayuda
          </h3>
          <div className="mt-3">
            <button className="btn btn-primary" onClick={onInfoStudentButtonClicked}>
              Información de estudiante
            </button>
            <a href="https://github.com/202208521-luis-morales/IPC2_Proyecto3_202208521/blob/main/Documentaci%C3%B3n/Documentaci%C3%B3n.pdf" target="_blank" rel="noopener noreferrer" className="btn btn-primary mx-3">
              Documentación del programa
            </a>
          </div>
        </div>
      </main>
      <script
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL"
        crossorigin="anonymous"
      ></script>
    </>
  );
}
