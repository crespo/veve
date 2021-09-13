const express = require("express");
const app = express();

const { MongoClient } = require("mongodb");

app.use(express.json());

const uri =
  "mongodb+srv://<user>:<password>@cluster0.qjtsf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
var pacote = "";

app.post("/dialogflow", (request, response) => {
  var displayName = request.body.queryResult.intent.displayName;

  let nome = request.body.queryResult.parameters.person.name;
  let cpf = request.body.queryResult.parameters.CPF;

  client.connect(async err => {
    const database = client.db("evertur");
    const collection = database.collection("reservas");

    let doc = {
      nome: nome,
      cpf: cpf,
      pacote: ""
    };

    if (displayName.includes("Noronha")) {
      pacote = "Fernando de Noronha";
      doc.pacote = "Fernando de Noronha";
    } else if (displayName.includes("Genipabu")) {
      pacote = "Dunas de Genipabu";
      doc.pacote = "Dunas de Genipabu";
    } else {
      pacote = "Ilhéus";
      doc.pacote = "Ilhéus";
    }

    const result = await collection.insertOne(doc);

    response.json({
      fulfillmentMessages: [
        {
          text: {
            text: [
              "Maravilha, " + nome + "! Você adquiriu o pacote: " + pacote + "."
            ]
          },
          platform: "FACEBOOK"
        },
        {
          payload: {
            facebook: {
              quick_replies: [
                {
                  payload: "inicio_postback",
                  title: "Sim",
                  content_type: "text"
                },
                {
                  payload: "despedida_postback",
                  title: "Não",
                  content_type: "text"
                }
              ],
              text: "Gostaria de mais alguma informação?"
            }
          },
          platform: "FACEBOOK"
        }
      ]
    });

    await client.close();
  });
});

app.listen(process.env.PORT || 8080);