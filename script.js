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

// ✅ Maintenant les données sont chargées, on peut remplir les datalists
  
  // Remplir la liste des marques
  const marques_disp = [...new Set(data_carto.map(item => item.Fabriquant))].filter(m => m).sort();
  const marquesDatalist = document.getElementById("marquesList");
  marques_disp.forEach(marque => {
    const option = document.createElement("option");
    option.value = marque;
    marquesDatalist.appendChild(option);
  });

  // Remplir la liste des fournisseurs
  const fournisseurs_disp = [...new Set(data_extractX3.map(item => item["Raison sociale"]))].filter(f => f).sort();
  const fournisseursDatalist = document.getElementById("fournisseursList");
  fournisseurs_disp.forEach(fournisseur => {
    const option = document.createElement("option");
    option.value = fournisseur;
    fournisseursDatalist.appendChild(option);
  });

  // Remplir la liste des familles
  const familles_disp = [...new Set(data_carto.map(item => item.Famille))].filter(f => f).sort();
  const famillesDatalist = document.getElementById("famillesList");
  familles_disp.forEach(famille => {
    const option = document.createElement("option");
    option.value = famille;
    famillesDatalist.appendChild(option);
  });

  // Remplir la liste des statuts
  const statuts_disp = ["Neuf", "Reconditionné", "Réparation"];
  const statutsDatalist = document.getElementById("statutsList");
  statuts_disp.forEach(statut => {
    const option = document.createElement("option");
    option.value = statut;
    statutsDatalist.appendChild(option);
  });
  
  console.log("✅ Datalists remplis avec", marques_disp.length, "marques et", fournisseurs_disp.length, "fournisseurs");

  //--------------------------------------------------------------------------------//
  //------------------------------------Variables-----------------------------------//
  //--------------------------------------------------------------------------------//


  // On récupère les éléments HTML par leur ID

  const inputFournisseur = document.getElementById ("inputFournisseur");
  const inputMarque = document.getElementById ("inputMarque");
  const inputFamille = document.getElementById ("inputFamille")
  const inputStatut = document.getElementById ("inputStatut");

  const btnValider = document.getElementById("btnValider")
  const btnEffacer = document.getElementById("btnEffacer")


  //---------------------------------MAIN---------------------------------//
  remplirTableau();

  btnEffacer.onclick = function () {
    inputFournisseur.value = "";
    inputMarque.value = "";
    inputFamille.value = "";
    inputStatut.value = "";
    remplirTableau();
    }

  function lancerRemplissage() {
      remplirTableau();
    }

    // Première condition du lancement de remplissage de tableau avec bouton valider
    btnValider.onclick = lancerRemplissage;


    // Deuxième condition du lancement de remplissage de tableau avec touche entrer
    [inputFournisseur, inputMarque, inputFamille, inputStatut].forEach(input => {
      input.addEventListener("keydown", function (e) {if (e.key === "Enter") {lancerRemplissage();}
      });
    });


  function remplirTableau() {
    const tbody = document.getElementById("resultsTableau");
    tbody.innerHTML = "";
    const valeursRenseignees = {
      fournisseur: inputFournisseur.value.trim().toUpperCase(),
      marque:      inputMarque.value.trim().toUpperCase(),
      famille:     inputFamille.value.trim().toUpperCase(),
    };

    // On construit les lignes à partir de data_extractX3 (liste des fournisseurs)
    const lignesTableau = [];

    // On dédoublonne les fournisseurs de data_extractX3
    const fournisseursUniques = [...new Set(data_extractX3.map(item => item["Raison sociale"]).filter(f => f))];

    // --------------------Récupération des infos dans le data_extractX3--------------------
    fournisseursUniques.forEach(raisonSociale => {
      const ligneX3 = data_extractX3.find(item => item["Raison sociale"] === raisonSociale);

      // Récupérer le Code fournisseur X3 associé (on prend le premier trouvé)
      const codeX3 = ligneX3 ? ligneX3["Code fournisseur"] : "";
      // Récupérer la devise du fournisseur
      const devise = ligneX3 ? ligneX3["Devise"] : "";
      
      // --------------------Récupération des infos dans le data_carto--------------------
      // Chercher les marques associées dans data_carto
      // On compare Raison sociale (X3) avec Fournisseur (carto), qui peut contenir plusieurs fournisseurs séparés par virgules
      const lignesCarto = data_carto.filter(item => {
        if (!item.Fournisseur) return false;
        return item.Fournisseur
          .split(",")
          .map(f => f.trim().toUpperCase())
          .includes(raisonSociale.toUpperCase());
      });

      // --------------------Récupération des infos dans le data_fourni--------------------
      const ligneFourni = data_fourni.find(
        item => item["Fournisseur"] === raisonSociale.toUpperCase()
      );
      const activite = ligneFourni ? ligneFourni["Activite"] || "" : "";
      const lienWeb = ligneFourni ? ligneFourni["Lien webshop"] || "" : "";
      const sousContrat = ligneFourni ? ligneFourni["Contrat ?"] || "" : "";



      // Définir la valeur des variables selon les 2 cas (si fournisseur de data_extractX3 associé à une marque de data_carto ou non)


      if (lignesCarto.length === 0) {
        // Pas de marque associée → une seule ligne avec marque et famille vides
        lignesTableau.push({
          fournisseur: raisonSociale,
          codeX3: codeX3,
          marque: "",
          famille: "",
          activite: activite,
          devise: devise,
          lienWeb: lienWeb,
          sousContrat: sousContrat,
          priorite: ""
        });
      } else {
        // Une ou plusieurs marque(s) associée(s) → une ligne par marque associée au fournisseur dans data_carto
        lignesCarto.forEach(item => {
          // Récupérer la position du fournisseur dans la liste de la marque pour la priorité
          const listeFournisseurs = item.Fournisseur
            ? item.Fournisseur.split(",").map(f => f.trim().toUpperCase())
            : [];
          
          const position = listeFournisseurs.indexOf(raisonSociale.toUpperCase());
          const priorite = position === 0 ? "Priorité 1"
                        : position === 1 ? "Priorité 2"
                        : position === 2 ? "Priorité 3"
                        : "";

          lignesTableau.push({
            fournisseur: raisonSociale,
            codeX3: codeX3,
            marque: item.Fabriquant || "",
            famille: item.Famille || "",
            activite: activite,
            devise: devise,
            lienWeb: lienWeb,
            sousContrat: sousContrat,
            priorite: priorite
          });
        });
      }
    });

  // Filtrage sur lignesTableau avant le remplissage HTML
  const lignesFiltrees = lignesTableau.filter(ligne => {
    if (valeursRenseignees.fournisseur && ligne.fournisseur.toUpperCase() !== valeursRenseignees.fournisseur) return false;
    if (valeursRenseignees.marque && ligne.marque.toUpperCase() !== valeursRenseignees.marque) return false;
    if (valeursRenseignees.famille && ligne.famille.toUpperCase() !== valeursRenseignees.famille) return false;
    return true;
  });

  // Remplissage du tableau HTML
  lignesFiltrees.forEach(ligne => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><a href="page_info.html?fournisseur=${encodeURIComponent(ligne.fournisseur)}" target="_blank">${ligne.fournisseur}</a></td>
      <td>${ligne.codeX3}</td>
      <td>${ligne.marque}</td>
      <td>${ligne.famille}</td>
      <td>${ligne.activite}</td>
      <td>${ligne.devise}</td>
      <td>${ligne.lienWeb}</td>
      <td>${ligne.sousContrat}</td>
      <td></td>
      <td>${ligne.priorite}</td>
    `;
    tbody.appendChild(tr);
  });
}

})
