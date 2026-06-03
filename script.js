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

  btnValider.onclick = lancerRemplissage;

  [inputFournisseur, inputMarque, inputFamille, inputStatut].forEach(input => {
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") { lancerRemplissage(); } });
  });

  function mettreAJourDatalist(lignes) {
    const marquesFiltrees = [...new Set(lignes.map(l => l.marque).filter(m => m))].sort();
    const marquesDatalist = document.getElementById("marquesList");
    marquesDatalist.innerHTML = "";
    marquesFiltrees.forEach(marque => {
      const option = document.createElement("option");
      option.value = marque;
      marquesDatalist.appendChild(option);
    });

    const famillesFiltrees = [...new Set(lignes.map(l => l.famille).filter(f => f))].sort();
    const famillesDatalist = document.getElementById("famillesList");
    famillesDatalist.innerHTML = "";
    famillesFiltrees.forEach(famille => {
      const option = document.createElement("option");
      option.value = famille;
      famillesDatalist.appendChild(option);
    });

    const fournisseursFiltres = [...new Map(
      lignes.filter(l => l.fournisseur)
        .map(l => [l.fournisseur, { raisonSociale: l.fournisseur, codeX3: l.codeX3 }])
    ).values()].sort((a, b) => a.raisonSociale.localeCompare(b.raisonSociale));

    const fournisseursDatalist = document.getElementById("fournisseursList");
    fournisseursDatalist.innerHTML = "";
    fournisseursFiltres.forEach(f => {
      const option = document.createElement("option");
      option.value = `${f.raisonSociale} - ${f.codeX3}`;
      fournisseursDatalist.appendChild(option);
    });


    const fournisseursPresents = [...new Set(lignes.map(l => l.fournisseur).filter(f => f))];
    const statutsPossibles = ["Neuf", "Reconditionné", "Réparation"];
    const colonnesStatut = { "Neuf": "Neuf ?", "Reconditionné": "Reconditionne ?", "Réparation": "Reparation ?" };

    const statutsFiltres = statutsPossibles.filter(statut => {
      return fournisseursPresents.some(fournisseur => {
        const ligneFourni = data_fourni.find(f => f["Fournisseur"] === fournisseur.toUpperCase());
        return ligneFourni && (ligneFourni[colonnesStatut[statut]] || "").toUpperCase() === "OUI";
      });
    });

    const statutsDatalist = document.getElementById("statutsList");
    statutsDatalist.innerHTML = "";
    statutsFiltres.forEach(statut => {
      const option = document.createElement("option");
      option.value = statut;
      statutsDatalist.appendChild(option);
    });

  }

  function remplirTableau() {
    const tbody = document.getElementById("resultsTableau");
    tbody.innerHTML = "";
    const valeursRenseignees = {
      fournisseur: inputFournisseur.value.split(" - ")[0].trim().toUpperCase(),
      marque:      inputMarque.value.trim().toUpperCase(),
      famille:     inputFamille.value.trim().toUpperCase(),
      statut:      inputStatut.value.trim(),
    };

    const lignesTableau = [];
    const fournisseursUniques = [...new Set(data_extractX3.map(item => item["Raison sociale"]).filter(f => f))];

    fournisseursUniques.forEach(raisonSociale => {
      const ligneX3 = data_extractX3.find(item => item["Raison sociale"] === raisonSociale);
      const codeX3 = ligneX3 ? ligneX3["Code fournisseur"] : "";
      const devise = ligneX3 ? ligneX3["Devise"] : "";

      const lignesCarto = data_carto.filter(item => {
        if (!item.Fournisseur) return false;
        return item.Fournisseur.split(",").map(f => f.trim().toUpperCase()).includes(raisonSociale.toUpperCase());
      });

      const ligneFourni = data_fourni.find(item => item["Fournisseur"] === raisonSociale.toUpperCase());
      const activite = ligneFourni ? ligneFourni["Activite"] || "" : "";
      const lienWeb = ligneFourni ? ligneFourni["Lien webshop"] || "" : "";
      const sousContrat = ligneFourni ? ligneFourni["Contrat ?"] || "" : "";

      if (lignesCarto.length === 0) {
        lignesTableau.push({ fournisseur: raisonSociale, codeX3, marque: "", famille: "", activite, devise, lienWeb, sousContrat, priorite: "" });
      } else {
        lignesCarto.forEach(item => {
          const listeFournisseurs = item.Fournisseur ? item.Fournisseur.split(",").map(f => f.trim().toUpperCase()) : [];
          const position = listeFournisseurs.indexOf(raisonSociale.toUpperCase());
          const priorite = position === 0 ? "1" : position === 1 ? "2" : position === 2 ? "3" : "";
          lignesTableau.push({ fournisseur: raisonSociale, codeX3, marque: item.Fabriquant || "", famille: item.Famille || "", activite, devise, lienWeb, sousContrat, priorite });
        });
      }
    });

    const lignesFiltrees = lignesTableau.filter(ligne => {
      if (valeursRenseignees.fournisseur && ligne.fournisseur.toUpperCase() !== valeursRenseignees.fournisseur) return false;
      if (valeursRenseignees.marque && ligne.marque.toUpperCase() !== valeursRenseignees.marque) return false;
      if (valeursRenseignees.famille && ligne.famille.toUpperCase() !== valeursRenseignees.famille) return false;
      if (valeursRenseignees.statut) {
        const colonneStatut = valeursRenseignees.statut === "Neuf" ? "Neuf ?"
                            : valeursRenseignees.statut === "Reconditionné" ? "Reconditionne ?"
                            : valeursRenseignees.statut === "Réparation" ? "Reparation ?"
                            : null;
        const ligneFourni = data_fourni.find(f => f["Fournisseur"] === ligne.fournisseur.toUpperCase());
        if (!ligneFourni || (ligneFourni[colonneStatut] || "").toUpperCase() !== "OUI") return false;
      }
      return true;
    });

    // Mettre à jour les datalists APRÈS le filtrage
    mettreAJourDatalist(lignesFiltrees);

    lignesFiltrees.forEach(ligne => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><a href="page_info.html?fournisseur=${encodeURIComponent(ligne.fournisseur)}" target="_blank">${ligne.fournisseur}</a></td>
        <td>${ligne.codeX3}</td>
        <td>${ligne.marque}</td>
        <td>${ligne.famille}</td>
        <td>${ligne.activite}</td>
        <td>${ligne.devise}</td>
        <td>${ligne.lienWeb ? `<a href="${ligne.lienWeb}" target="_blank">${ligne.lienWeb}</a>` : ""}</td>
        <td>${ligne.sousContrat}</td>
        <td></td>
        <td>${ligne.priorite}</td>
      `;
      tbody.appendChild(tr);
    });
  }

})
