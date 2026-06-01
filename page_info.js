// Récupérer depuis query param
const params = new URLSearchParams(window.location.search);
const fournisseur = params.get("fournisseur") || "Inconnu";

// Mettre dans le titre de l'onglet
document.title = `Informations ${fournisseur}`;


//------------------------------------------------------------------------------//
//-------------------------------------DATA-------------------------------------//
//------------------------------------------------------------------------------//

let data_cartoLoaded = false;
let data_fourniLoaded = false;
let data_extractX3Loaded = false;
let data_carto = [];
let data_fourni = [];
let data_extractX3 = [];

async function chargerDonnees() {
  try {
    const response = await fetch("data.json");
    const data = await response.json();

    // CARTO
    data_carto = data.carto.map(row => {
      let obj = {};
      Object.keys(row).forEach(key => {
        obj[key.trim()] = String(row[key] || "")
          .replace(/\r/g, "")
          .trim()
          .toUpperCase();
      });
      return obj;
    });

    data_cartoLoaded = true;
    console.log("✅ Carto chargée :", data_carto);

    // FOURNI
    const colonnesMinusculesFourni = ["Info accord", "Contact", "Mail", "Lien webshop", "Telephone"];

    data_fourni = data.fourni.map(row => {
      let obj = {};
      Object.keys(row).forEach(key => {
        let valeur = String(row[key] || "")
          .replace(/\r/g, "")
          .trim();

        if (!colonnesMinusculesFourni.includes(key)) {
          valeur = valeur.toUpperCase();
        }

        obj[key.trim()] = valeur;
      });
      return obj;
    });

    data_fourniLoaded = true;
    console.log("✅ Fourni chargée :", data_fourni);


    // Extract X3
    const colonnesMinusculesX3 = ["Civilité", "Prénom","Nom", "E-mail", "Téléphone", "Fonction"];

    data_extractX3 = data.extractX3
      .filter(row => String(row["Actif"] || "").trim().toUpperCase() === "OUI")
      .map(row => {
        let obj = {};
        Object.keys(row).forEach(key => {
          let valeur = String(row[key] || "")
            .replace(/\r/g, "")
            .trim();

          if (!colonnesMinusculesX3.includes(key)) {
            valeur = valeur.toUpperCase();
          }

          obj[key.trim()] = valeur;
        });
        return obj;
      });

    data_extractX3Loaded = true;
    console.log("✅ ExtractX3 chargée :", data_extractX3);
    console.log("data_carto :", data_carto.length);
    console.log("data_fourni :", data_fourni.length);
    console.log("data_extractX3 :", data_extractX3.length);

  } catch (error) {
    console.error("❌ Erreur chargement JSON :", error);
  }
}

chargerDonnees().then(() => {

  

  //---------------------------------------------------------------------------------//
  //-----------------------------------Recup infos-----------------------------------//
  //---------------------------------------------------------------------------------//

  // Recup dans data_fourni
  const ligneFourni = data_fourni.find(  
    item => item.Fournisseur === fournisseur
  );

  // Recup dans data_extractX3
  const lignesExtract = data_extractX3.filter(
    item => item["Raison sociale"] === fournisseur
  );

  //--------------------------------Nom du fournisseur-------------------------------//
  document.getElementById("fournisseurNom").textContent = fournisseur;
  
  document.getElementById("denomX3").textContent = lignesExtract[0]["Code fournisseur"]
  
  
  

  //---------------------Savoir si commandé avec lui depuis 2 ans--------------------//

  const warning_comm = document.getElementById("ligne_warning")

  if (ligneFourni && ligneFourni["Commande < 2 ans ?"] === "NON"){
    warning_comm.style.display ="flex"
  }
  else{
    warning_comm.style.display ="none"
  }

  //-----------------------Savoir l'activité du fournisseur-----------------------//
  if (ligneFourni && ligneFourni["Activite"]){
    document.getElementById("activite").textContent = ligneFourni["Activite"]
  }
  

  //---------------------Savoir si fournisseur en contrat, en accord co ou rien---------------------//
  const rouge = document.getElementById("rouge")
  const vert = document.getElementById("vert")
  const gris = document.getElementById("gris")

  

  if (ligneFourni && ligneFourni["Contrat ?"] === "OUI" && ligneFourni["Accord co ?"] === "NON"){  
    document.getElementById("Contrat").textContent = "Contrat Cadre"

    vert.style.display ="block"
    rouge.style.display ="none"
    gris.style.display ="none"
    
  }

  else if (ligneFourni && ligneFourni["Contrat ?"] === "NON" && ligneFourni["Accord co ?"] === "OUI"){  
    document.getElementById("Contrat").textContent = "Accord Commercial"

    rouge.style.display ="block"
    gris.style.display ="none"
    vert.style.display ="none"
    
  }

  else {
    document.getElementById("Contrat").textContent = "Absence de Contrat/Accord"

    gris.style.display ="block"
    vert.style.display ="none"
    rouge.style.display ="none"
  }


  //------------------------Mettre commentaire après info accord ou contrat ou rien------------------------//
  
  
  if (ligneFourni && ligneFourni["Info accord"]){
    const commentaireElement = document.getElementById("commentaire");
    const infos = ligneFourni["Info accord"].split(",").map(info => info.trim());
    
    // Vider le contenu
    commentaireElement.innerHTML = "";
    
    // Créer un span pour chaque info
    infos.forEach(info => {
      if (info) {  // Vérifier que l'info n'est pas vide
        const infoSpan = document.createElement("span");
        infoSpan.textContent = `• ${info}`;
        infoSpan.style.display = "block";  // Chaque info sur une nouvelle ligne
        infoSpan.style.marginTop = "5px";
        commentaireElement.appendChild(infoSpan);
      }
    });
  }


  //---------------------------------Ajouter le ou les contact(s))---------------------------------//

  const prenoms    = lignesExtract.map(l => l["Prénom"]);
  const noms       = lignesExtract.map(l => l["Nom"]);
  const fonctions  = lignesExtract.map(l => l["Fonction"]);
  const mails      = lignesExtract.map(l => l["E-mail"]);
  const telephones = lignesExtract.map(l => l["Téléphone"]);

  // Récupérer le conteneur
  const contactsContainer = document.getElementById("contacts");
  contactsContainer.innerHTML = ""; // Vider le contenu

  // Créer le titre "Contacts :"
  const intitule = document.createElement("span");
  intitule.id = "intitule";
  intitule.textContent = "Contacts :";
  intitule.style.fontWeight = "bold";
  intitule.style.fontSize = "32px";
  intitule.style.marginBottom = "30px";
  contactsContainer.appendChild(intitule);

  // Créer un conteneur pour tous les contacts (affichage horizontal)
  const tousContacts = document.createElement("div");
  tousContacts.style.display = "flex";
  tousContacts.style.flexDirection = "column";
  tousContacts.style.gap = "50px"; // Espace entre chaque contact
  tousContacts.style.marginTop = "10px";

  // Boucle pour créer chaque contact
  const nbContacts = Math.max(prenoms.length, noms.length, fonctions.length, mails.length, telephones.length);

  for (let i = 0; i < nbContacts; i++) {
    const contactDiv = document.createElement("div");
    contactDiv.style.position = "relative";  // Ajouter pour positionner la fonction
    contactDiv.style.display = "flex";
    contactDiv.style.flexDirection = "column";
    contactDiv.style.border = "1px solid #707173";
    contactDiv.style.borderRadius = "10px";
    contactDiv.style.padding = "15px";
    contactDiv.style.paddingTop = "25px";  // Plus d'espace en haut pour la fonction
    contactDiv.style.backgroundColor = "#f9f9f9";
    contactDiv.style.marginTop = "15px";  // Espace pour que la fonction ne soit pas coupée
    
    // Fonction (en haut à gauche, chevauchant le cadre)
    if (fonctions[i]) {
      const fonctionSpan = document.createElement("span");
      fonctionSpan.className = "contact-fonction";
      fonctionSpan.textContent = fonctions[i];
      fonctionSpan.style.position = "absolute";
      fonctionSpan.style.top = "-12px";
      fonctionSpan.style.left = "15px";
      fonctionSpan.style.backgroundColor = "#f9f9f9";
      fonctionSpan.style.padding = "2px 10px";
      fonctionSpan.style.fontSize = "18px";
      fonctionSpan.style.fontWeight = "bold";
      fonctionSpan.style.color = "#707173";
      fonctionSpan.style.border = "1px solid #707173";
      fonctionSpan.style.borderRadius = "5px";
      contactDiv.appendChild(fonctionSpan);
    }

    // Prénom
    if (prenoms[i]) {
      const nomSpan = document.createElement("span");
      nomSpan.className = "contact-info";
      nomSpan.innerHTML = `• <strong>Prénom :</strong> ${prenoms[i]}`;
      nomSpan.style.marginLeft = "20px";
      nomSpan.style.marginTop = "5px";
      contactDiv.appendChild(nomSpan);
    }
    
    // Nom
    if (noms[i]) {
      const nomSpan = document.createElement("span");
      nomSpan.className = "contact-info";
      nomSpan.innerHTML = `• <strong>Nom :</strong> ${noms[i]}`;
      nomSpan.style.marginLeft = "20px";
      nomSpan.style.marginTop = "5px";
      contactDiv.appendChild(nomSpan);
    }

    // Mail
    if (mails[i]) {
      const mailSpan = document.createElement("span");
      mailSpan.className = "contact-info";
      mailSpan.innerHTML = `• <strong>Mail :</strong> ${mails[i]}`;
      mailSpan.style.marginLeft = "20px";
      mailSpan.style.marginTop = "5px";
      contactDiv.appendChild(mailSpan);
    }

    // Téléphone
    if (telephones[i]) {
      const telSpan = document.createElement("span");
      telSpan.className = "contact-info";
      telSpan.innerHTML = `• <strong>Téléphone :</strong> ${telephones[i]}`;
      telSpan.style.marginLeft = "20px";
      telSpan.style.marginTop = "5px";
      contactDiv.appendChild(telSpan);
    }
    
    tousContacts.appendChild(contactDiv);
  }

  contactsContainer.appendChild(tousContacts);

  //------------------------------------------Pays------------------------------------------//

  
  document.getElementById("pays").textContent= lignesExtract[0]["Pays"]
  


  //------------------------------------------Devise------------------------------------------//


  document.getElementById("devise").textContent= lignesExtract[0]["Devise"]
  

  //---------------------------------------Lien webshop---------------------------------------//
  const ligne_webshop = document.getElementById("ligne_webshop")

  if (ligneFourni && ligneFourni["Lien webshop"]){
    document.getElementById("lien").innerHTML = `<a href="${ligneFourni["Lien webshop"]}" target="_blank">WebShop</a>`;
  }
  else {
    ligne_webshop.style.display = "none"
  }

});  
