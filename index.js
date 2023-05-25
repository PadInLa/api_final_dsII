const express = require("express");
const app = express();
const port = process.env.PORT || 8080;
const cors = require("cors");
const morgan = require("morgan");
const fs = require("fs");
const csv = require("csv-parser");

const results = [];
const cityToDepartment = new Map();

// convierte el csv en un map
fs.createReadStream("DATOSFINAL.csv")
  .pipe(csv())
  .on("data", (data) => results.push(data))
  .on("end", () => {
    results.forEach((row) => {
      // poner todas las columnas en minusculas y quitar los acentos
      const city = row["MUNICIPIO"]
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
      const department = row["DEPARTAMENTO"]
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
      // console.log(city, department);
      cityToDepartment.set(city, department);
    });
  });

app.use(cors());
app.use(morgan("dev"));

app.get("/:city", (req, res) => {
  const city = req.params.city;
  // convertir el parametro a minusculas y quitar los acentos
  const cityWithoutAccents = city
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  // se evalua primero si es una de las ciudades principales, sino se busca en el map
  switch (cityWithoutAccents) {
    case "bogota":
      res.send("Cundinamarca");
      break;
    case "cartagena":
      res.send("Bolivar");
      break;
    case "barranquilla":
      res.send("Atlantico");
      break;
    case "santa marta":
      res.send("Magdalena");
      break;
    default:
      // obetener el departamento del map
      const department = cityToDepartment.get(cityWithoutAccents) || city;
      // poner la primera letra del departamento en mayuscula
      console.log(department);
      const departmentWithUppercase =
        department.charAt(0).toUpperCase() + department.slice(1);

      // enviar respuesta
      res.send(departmentWithUppercase);

      break;
  }
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`App listening ${port}`);
});
