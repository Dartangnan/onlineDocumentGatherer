// -=-=-=-=-=-= Importing modules =-=-=-=-=-=-=-
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const { chromium } = require("playwright");
const fs = require("fs");
const axios = require("axios");

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

// -=-=-=-=-=-= Functions =-=-=-=-=-=-=-
const validateCNPJ = function (cnpj) {
  // turn into number
  let newCNPJ = cnpj
    .replace("/", "")
    .replace(/\./g, "")
    .replace(/\-/g, "")
    .replace(/\s/g, "");

  let cnpjSize = newCNPJ.length;
  newCNPJ = +newCNPJ;
};

const postRequestCaptcha = async function () {
  try {
    //Convert the img to base 64
    const captchaImg = fs.readFileSync("public/captcha.png");
    const imgBase64 = Buffer.from(captchaImg).toString("base64");
    // Post request to 2captcha so they can solve it
    const idRes = await axios.post(
      "http://2captcha.com/in.php?key=7aa7004be5c01067ea34dc565802f656",
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
    `https://2captcha.com/res.php?key=7aa7004be5c01067ea34dc565802f656&action=get&json=1&id=${idEl}`
  );
  return crackedCaptcha.data.request;
};

const fetchCertificate = async function (cnpj) {
  try {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    context.on("page", async (newPage) => {
      await page.waitForTimeout(1000);
      //   await newPage.screenshot({ path: "public/page.png", fullPage: true });
      await newPage.emulateMedia({ media: "screen" });
      await newPage.pdf({ path: "public/page.pdf" });
      await browser.close();
    });
    await page.goto(
      "https://servicos.receita.fazenda.gov.br/Servicos/certidao/CNDConjuntaInter/InformaNICertidao.asp?tipo=1"
    );
    await page.fill('input[name="NI"]', cnpj);
    // The captcha is reloaded once, so we wait 1s until the new image is shown
    await page.waitForTimeout(1000);
    const svgImage = await page.$("#imgCaptchaSerpro");
    await svgImage.screenshot({ path: "public/captcha.png" });
    const idCaptcha = await postRequestCaptcha();
    // The 2Captcha asks for a 5s timer so they can solve the captcha and send it back
    await page.waitForTimeout(5500);
    const crackedCaptcha = await getRequestCaptcha(idCaptcha);
    await page.fill("#txtTexto_captcha_serpro_gov_br", crackedCaptcha);
    await page.click("#submit1");
    await page.click('"Emissão de nova certidão"');
    await page.click('img[alt="Preparar Página para Impressão"]');
  } catch (err) {
    console.log(err);
  }
};
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

// -=-=-=-=-=-= GET requests =-=-=-=-=-=-=-
app.get("/", function (req, res) {
  res.render("home");
});

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

// -=-=-=-=-=-= POST requests =-=-=-=-=-=-=-
app.post("/", function (req, res) {
  let cnpj = req.body.cnpj;

  console.log(newCNPJ, cnpjSize);
  console.log(typeof newCNPJ);

  //   fetchCertificate(cnpj);
});
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

// -=-=-=-=-=-= server port requests =-=-=-=-=-=-=-
app.listen(3000, function () {
  console.log("Listening on port 3000.");
});
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
