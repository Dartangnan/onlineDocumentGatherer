// -=-=-=-=-=-= Importing modules =-=-=-=-=-=-=-
require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const { chromium } = require("playwright");
const fs = require("fs");
const axios = require("axios");
const mongoose = require("mongoose");

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

// -=-=-=-=-=-= Setting up app =-=-=-=-=-=-=-

const app = express();

// templating:
app.set("view engine", "ejs");

// Parse information:
app.use(bodyParser.urlencoded({ extended: false }));

// Define the static files folder
app.use(express.static(__dirname + "/public"));

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

// -=-=-=-=-=-= Database =-=-=-=-=-=-=-
mongoose.connect(
  `mongodb+srv://admin-dart:${process.env.DB}@cluster0.olp8q.mongodb.net/contactsDB`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const contactSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: String,
});

const Contact = mongoose.model("contact", contactSchema);

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

// -=-=-=-=-=-= Functions =-=-=-=-=-=-=-
const validateCNPJ = function (cnpj) {
  // turn into number
  let newCNPJ = cnpj
    .replace("/", "")
    .replace(/\./g, "")
    .replace(/\-/g, "")
    .replace(/\s/g, "");

  //Checking if there are invalid characters
  newCNPJNumber = +newCNPJ;
  if (typeof newCNPJNumber !== "number" || isNaN(newCNPJNumber))
    return "Error! Input contains invalid characters!";

  //Checking number of digits
  let cnpjSize = newCNPJ.length;
  if (cnpjSize !== 14)
    return "Error! The length of the CNPJ entered is not valid!";

  // Validating the CNPJ pattern
  //http://www.macoratti.net/alg_cnpj.htm#:~:text=Algoritmo%20para%20valida%C3%A7%C3%A3o%20do%20CNPJ&text=O%20n%C3%BAmero%20que%20comp%C3%B5e%20o,que%20s%C3%A3o%20os%20d%C3%ADgitos%20verificadores.
  // Two last digits:
  n1 = Math.trunc((newCNPJ % 100) / 10);
  n2 = newCNPJ % 10;
  // Vectors used to validate:
  arrayToBeValidated = newCNPJ.slice(0, -2).split("");
  validationVectorOne = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  validationVectorTwo = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  //Checking if the numbers meet the CNPJ creation logic/algorithm
  sum1 = validationVectorOne
    .map((el, index) => {
      return el * +arrayToBeValidated[index];
    })
    .reduce((acc, val) => acc + val);
  validDigit1 = sum1 % 11 < 2 ? 0 : 11 - (sum1 % 11);
  sizeArray = arrayToBeValidated.push(validDigit1);

  sum2 = validationVectorTwo
    .map((el, index) => {
      return el * +arrayToBeValidated[index];
    })
    .reduce((acc, val) => acc + val);
  validDigit2 = sum2 % 11 < 2 ? 0 : 11 - (sum2 % 11);

  if (validDigit1 !== n1 || validDigit2 !== n2)
    return "Error! Invalid CNPJ number!";
  return newCNPJNumber;
};

const postRequestCaptcha = async function () {
  try {
    //Convert the img to base 64
    const captchaImg = fs.readFileSync("public/captcha.png");
    const imgBase64 = Buffer.from(captchaImg).toString("base64");
    // Post request to 2captcha so they can solve it
    const idRes = await axios.post(
      `http://2captcha.com/in.php?key=${process.env.APIKEY}`,
      {
        method: "base64",
        body: imgBase64,
      }
    );
    const idSend = await idRes.data.substring(3);
    // Return ID that is going to be used in the get response later
    return idSend;
  } catch (err) {
    console.log(err);
  }
};

const getRequestCaptcha = async function (idEl) {
  // Get request to 2Captcha so we can get the text corresponding to the captcha
  const crackedCaptcha = await axios.get(
    `https://2captcha.com/res.php?key=${process.env.APIKEY}&action=get&json=1&id=${idEl}`
  );
  return crackedCaptcha.data.request;
};
let path = "";
const fetchCertificate = async function (ans) {
  try {
    const browser = await chromium.launch({
      headless: true,
      chromiumSandbox: false,
      downloadsPath: __dirname,
    });
    // const context = await browser.newContext({ acceptDownloads: true });
    // await chromium.launchPersistentContext("../public/", {
    //   options: { acceptDownloads: true },
    // });
    const context = await browser.newContext({
      acceptDownloads: true,
      downloadsPath: __dirname,
    });
    const page = await context.newPage();
    context.on("page", async (newPage) => {
      await page.waitForTimeout(1000);
      //   await newPage.screenshot({ path: "public/page.png", fullPage: true });
      await newPage.emulateMedia({ media: "screen" });
      await newPage.pdf({ path: __dirname + "public/page.pdf" });
      await browser.close();
    });
    await page.goto(
      "https://servicos.receita.fazenda.gov.br/Servicos/certidao/CNDConjuntaInter/InformaNICertidao.asp?tipo=1"
    );
    await page.fill('input[name="NI"]', ans);
    // The captcha is reloaded once, so we wait 1s until the new image is shown
    console.log(__dirname + "\\");
    await page.waitForTimeout(1000);
    const svgImage = await page.$("#imgCaptchaSerpro");
    await svgImage.screenshot({ path: "public/captcha.png" });
    const idCaptcha = await postRequestCaptcha();
    // The 2Captcha asks for a 5s timer so they can solve the captcha and send it back
    await page.waitForTimeout(5500);
    const crackedCaptcha = await getRequestCaptcha(idCaptcha);
    await page.fill("#txtTexto_captcha_serpro_gov_br", crackedCaptcha);
    await page.click("#validar");
    await page.click('"Emissão de nova certidão"');
    const [download] = await Promise.all([
      page.waitForEvent("download"), // wait for download to start
      // page.click("a"),
    ]);
    // await download.saveAs(__dirname + "\\");
    // await download.delete();
    // wait for download to complete
    path = await download.path();
    console.log(path);
    // await page.click('img[alt="Preparar Página para Impressão"]');
    return path;
  } catch (err) {
    console.log(err);
    return false;
  }
};
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

// -=-=-=-=-=-= GET requests =-=-=-=-=-=-=-
let dataError = { answerCNPJ: "" };
app.get("/", function (req, res) {
  res.render("home", dataError);
});

app.get("/cnpj-check/:cnpj", function (req, res) {
  ans = validateCNPJ(req.params.cnpj);
  if (typeof ans === "string") {
    res.send({ answerCNPJ: ans, pdfFile: false });
  }
  if (typeof ans === "number") {
    fetchCertificate(`${ans}`).then((a) => {
      if (!a) {
        res.send({
          answerCNPJ: "Ops! Something went wrong, please try again!",
          pdfFile: a,
        });
      } else {
        console.log(path);
        res.send({ answerCNPJ: "", pdfFile: a });
      }
    });
  }
});

app.get("/download", function (req, res) {
  // const file = `${__dirname}/public/page.pdf`;
  const file = path;
  res.download(file);
});

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

// -=-=-=-=-=-= POST requests =-=-=-=-=-=-=-

app.post("/save-contact", function (req, res) {
  info = req.body;
  console.log(req.body);

  const contact = new Contact({
    name: req.body.name,
    phone: req.body.phone,
    email: req.body.email,
  });

  console.log(contact);
  res.redirect("/");

  contact.save();
});
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

// -=-=-=-=-=-= server port requests =-=-=-=-=-=-=-
let port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log("Listening...");
});
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
