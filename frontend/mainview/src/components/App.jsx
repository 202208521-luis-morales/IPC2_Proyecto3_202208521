import React, { useEffect, useRef } from "react";
import Swal from "sweetalert2";
import Chart from "chart.js/auto"

export default function App() {
  const chartRef = useRef(null);
  function prueba() {
    Swal.fire("Probando", "Probando texto", "success");
  }

  useEffect(() => {
    /*
    const ctx = chartRef.current.getContext("2d");
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Enero", "Febrero", "Marzo", "Abril", "Mayo"],
        datasets: [
          {
            label: "Ventas Mensuales",
            data: [12, 19, 3, 5, 2],
          },
        ],
      },
    });
    */
  }, []);
  return (
    <>
      <nav className="navbar bg-primary">
        <div className="container">
          <span className="navbar-brand mb-0 h1">Proyecto 2 | 202208521</span>
        </div>
      </nav>
      <main className="container mt-4 mb-5">
        <div className="card mt-4">
          <div className="card-header">Opciones</div>
          <div className="card-body row">
            <div className="col">
              <button className="btn btn-primary">Resetear datos</button>
            </div>
            <div className="col">
              <div className="form-group">
                <h5>Cargar archivo de mensajes:</h5>
                <input
                  type="file"
                  className="custom-file-input2 btn btn-secondary"
                  id="myFileInput"
                />
              </div>
              <div>
                <button className="btn btn-primary">Cargar</button>
                <button className="btn btn-success" style={{marginLeft: 10}}>Obtener resumen</button>
              </div>
            </div>

            <div className="col">
              <div className="form-group">
                <h5>Cargar archivo de configuración:</h5>
                <input
                  className="custom-file-input2 btn btn-secondary"
                  type="file"
                  name="load-config"
                  id="load-config"
                />
              </div>
              <div>
                <button className="btn btn-primary">Cargar</button>
                <button className="btn btn-success" style={{marginLeft: 10}}>Obtener resumen</button>
              </div>
            </div>
          </div>
        </div>

        <div className="card mt-4">
          <div className="card-header">Peticiones</div>
          <div className="card-body row">
            <div className="col">
              <div className="form-group">
                <h6>Consultar:</h6>
                <select className="form-control" style={{ width: "250px" }}>
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
                  />
                  <span className="mx-2"> - </span>
                  <input
                    type="date"
                    className="form-control"
                    style={{ width: "175px" }}
                  />
                </div>
              </div>
              <div className="form-group">
                <button className="btn btn-primary">Consultar</button>
              </div>
            </div>
            <div className="col">
              <div>
                <h6>Resultado</h6>
                <textarea
                  disabled
                  defaultValue={"Bienvenido: Realiza tu consulta"}
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
            { true ? <></>: (<div className="p-3 rounded" style={{backgroundColor: "#eee"}}>
              <canvas ref={chartRef} />
            </div>)}
          </div>
        </div>

        <div className="mt-4">
          <h3>
            <i className="fa-regular fa-circle-question"></i> Ayuda
          </h3>
          <div className="mt-3">
            <button className="btn btn-primary" onClick={prueba}>
              Información de estudiante
            </button>
            <button className="btn btn-primary mx-3">
              Documentación del programa
            </button>
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
