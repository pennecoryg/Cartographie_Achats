//------------------------------------------------------------------------------//
//-------------------------------------DATA-------------------------------------//
//------------------------------------------------------------------------------//

let data_cartoLoaded = false;
let data_fourniLoaded = false;
let data_carto = [];
let data_fourni = [];

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
    const colonnesMinuscules = ["Info accord", "Contact", "Mail", "Lien webshop", "Telephone"];

    data_fourni = data.fourni.map(row => {
      let obj = {};
      Object.keys(row).forEach(key => {
        let valeur = String(row[key] || "")
          .replace(/\r/g, "")
          .trim();

        if (!colonnesMinuscules.includes(key)) {
          valeur = valeur.toUpperCase();
        }

        obj[key.trim()] = valeur;
      });
      return obj;
    });

    data_fourniLoaded = true;
    console.log("✅ Fourni chargée :", data_fourni);

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
  const fournisseurs_disp = [...new Set(data_fourni.map(item => item.Fournisseur))].filter(f => f).sort();
  const fournisseursDatalist = document.getElementById("fournisseursList");
  fournisseurs_disp.forEach(fournisseur => {
    const option = document.createElement("option");
    option.value = fournisseur;
    fournisseursDatalist.appendChild(option);
  });
  
  console.log("✅ Datalists remplis avec", marques_disp.length, "marques et", fournisseurs_disp.length, "fournisseurs");
  //--------------------------------------------------------------------------------//
  //------------------------------------Variables-----------------------------------//
  //--------------------------------------------------------------------------------//
  
  
  // On récupère les éléments HTML par leur ID
  const btnFournisseur = document.getElementById("btnFournisseur");
  const btnMarque = document.getElementById("btnMarque");
  
  const toolbarFournisseur = document.getElementById("toolbarFournisseur");
  const toolbarMarque = document.getElementById("toolbarMarque");
  
  const inputFournisseur = document.getElementById ("inputFournisseur")
  const inputMarque = document.getElementById ("inputMarque")
  const ChoixFenêtre = document.getElementById("ChoixFenêtre")
  
  const btnNeuf = document.getElementById("btnNeuf");
  const btnReconditionne = document.getElementById("btnReconditionne");
  const btnReparation = document.getElementById("btnReparation");
  
  const messageFournisseur = document.getElementById("messageFournisseur");
  const messageMarque = document.getElementById("messageMarque");
  
  const pageFournisseur = document.getElementById("pageFournisseur")
  const pageMarque = document.getElementById("pageMarque")
  
  const messageFourniNeuf = document.getElementById("messageFourniNeuf")
  const messageFourniRec = document.getElementById("messageFourniRec")
  const messageFourniRep = document.getElementById("messageFourniRep")
  
  const messageMarqueNeuf = document.getElementById("messageMarqueNeuf")
  const messageMarqueRec = document.getElementById("messageMarqueRec")
  const messageMarqueRep = document.getElementById("messageMarqueRep")
  
  const lstFourni = document.getElementById("lstFourni");
  const lstMarque = document.getElementById("lstMarque");
  const lstFamilleM = document.getElementById("lstFamilleM");
  const lstFamilleF = document.getElementById("lstFamilleF");
  
  lstFourni.addEventListener("change", appliquerFiltresMarque);
  lstFamilleM.addEventListener("change", appliquerFiltresMarque);
  lstMarque.addEventListener("change", appliquerFiltresFournisseur);
  lstFamilleF.addEventListener("change", appliquerFiltresFournisseur);
  
  
  
  //--------------------------------------------------------------------------------//
  //-------------------------------------Actions------------------------------------//
  //--------------------------------------------------------------------------------//
  
  
  /* Quand on clique sur Marque
  - on affiche la toolbar correspondante
  - on cache l'autre toolbar
  */
  btnMarque.onclick = function () {
    toolbarMarque.style.display = "block";
    toolbarFournisseur.style.display = "none";
    ChoixFenêtre.style.display = "none";
    pageFournisseur.style.display = "none";
    pageMarque.style.display = "none";
    cleanMessages();
  };
  
  
  
  /*
  Quand on clique sur Fournisseur :
  - on affiche la toolbar correspondante
  - on cache l'autre toolbar
  */
  btnFournisseur.onclick = function () {
    toolbarFournisseur.style.display = "block";
    toolbarMarque.style.display = "none";
    ChoixFenêtre.style.display = "none";
    pageFournisseur.style.display = "none";
    pageMarque.style.display = "none";
    cleanMessages();
  };
  
  
  //---------------------------------MAIN PAGE MARQUE---------------------------------//
  
  
  
  /* Quand on fait entrer après avoir mis la marque :
  on affiche les 3 fenêtres si marque est bien dans 
  excel sinon afficher "Marque inconnue"
  */
  inputMarque.addEventListener("keydown", function(event) {
    ChoixFenêtre.style.display = "none";
    pageMarque.style.display = "none";
    cleanMessages();
    if (event.key === "Enter") {
  
      const valeur = inputMarque.value.trim().toUpperCase();
  
      if (!valeur) {  // Si valeur nulle (case vide dans le excel)
        ChoixFenêtre.style.display = "none";
        pageMarque.style.display = "none";
        messageMarque.style.display = "block"; // ou un message dédié
        return;
      }
  
      // 1️⃣ Est-ce que la marque existe ?
      const marqueExiste = data_carto.some(
        item => item.Fabriquant === valeur
      );
  
      // 2️⃣ On récupère toutes les lignes de cette marque
      const lignesMarque = data_carto.filter(
        item => item.Fabriquant === valeur
      );
  
      // 3️⃣ Vérifier si AU MOINS UNE ligne contient OUI
      const marqueNeufExiste = lignesMarque.some(
        item => item["Neuf ?"] === "OUI"
      );
  
      const marqueRecExiste = lignesMarque.some(
        item => item["Reconditionne ?"] === "OUI"
      );
  
      const marqueRepExiste = lignesMarque.some(
        item => item["Reparation ?"]=== "OUI"
      );
  
  
     if (marqueExiste) {
      ChoixFenêtre.style.display = "block"; // boutons Neuf/Rec/Rep
  
      btnNeuf.onclick = function () {
        hideMarqueMessages();
        pageMarque.style.display = "none";
        setActiveButton(btnNeuf);
        if (marqueNeufExiste) {
          pageMarque.style.display = "block";
          remplirTableMarque(lignesMarque, "Neuf");
          remplirFiltresMarque(lignesMarque, "Neuf");
        } else {
          messageMarqueNeuf.style.display = "block";
        }
      };
  
      
      btnReconditionne.onclick = function () {
        hideMarqueMessages();
        pageMarque.style.display = "none";
        setActiveButton(btnReconditionne);
        if (marqueRecExiste) {
          pageMarque.style.display = "block";
          remplirTableMarque(lignesMarque, "Reconditionne");
          remplirFiltresMarque(lignesMarque, "Reconditionne");
        } else {
          messageMarqueRec.style.display = "block";
        }
      };
    
      
      btnReparation.onclick = function () {
        hideMarqueMessages();
        pageMarque.style.display = "none";
        setActiveButton(btnReparation);
        if (marqueRepExiste) {
          pageMarque.style.display = "block";
          remplirTableMarque(lignesMarque, "Reparation");
          remplirFiltresMarque(lignesMarque, "Reparation");
        } else {
          messageMarqueRep.style.display = "block";
        }
      };
  
  
      } else {
      // fournisseur inconnu
      ChoixFenêtre.style.display = "none";
      messageMarque.style.display = "block";
      }
    }
  });
  
  
  
  //-------------------------------MAIN PAGE FOURNISSEUR-------------------------------//
  
  
  /* Quand on fait entrer après avoir mis le fournisseur :
  on affiche les 3 fenêtres si fournisseur est bien dans 
  excel sinon afficher "Fournisseur inconnu"
  */
  inputFournisseur.addEventListener("keydown", function(event) {
    
    ChoixFenêtre.style.display = "none";
    pageFournisseur.style.display = "none";
    cleanMessages();
    if (event.key === "Enter") {
  
      const valeur = inputFournisseur.value.trim().toUpperCase();
  
      if (!valeur) { // Si valeur nulle (case vide dans le excel)
        ChoixFenêtre.style.display = "none";
        pageMarque.style.display = "none";
        messageMarque.style.display = "block"; 
        return;
      }
  
      // 1️⃣ Est-ce que le fournisseur existe ?
      const fournisseurExiste = data_carto.some(item => fournisseurMatch(item, valeur));
  
      // 2️⃣ On récupère toutes les lignes de ce fournisseur
      const lignesFournisseur = data_carto.filter(item => fournisseurMatch(item, valeur));
  
      // 3️⃣ Vérifier si AU MOINS UNE ligne contient OUI
      const fourniNeufExiste = fournisseurAutorisePourType(valeur, "Neuf");
      const fourniRecExiste = fournisseurAutorisePourType(valeur, "Reconditionne");
      const fourniRepExiste = fournisseurAutorisePourType(valeur, "Reparation");
  
  
  
     if (fournisseurExiste) {
      ChoixFenêtre.style.display = "block"; // boutons Neuf/Rec/Rep
      
  
      btnNeuf.onclick = function () {
        hideFourniMessages();
        pageFournisseur.style.display = "none";
        setActiveButton(btnNeuf);
  
        const autorise =
          fournisseurAutorisePourType(valeur, "Neuf") &&
          fournisseurADesMarquesPourType(valeur, lignesFournisseur, "Neuf");
  
        if (autorise) {
          pageFournisseur.style.display = "block";
          remplirTableFournisseur(valeur, lignesFournisseur, "Neuf");
          remplirFiltresFournisseur(lignesFournisseur, "Neuf");
        } else {
          messageFourniNeuf.style.display = "block";
        }
      };
  
      
      btnReconditionne.onclick = function () {
        hideFourniMessages();
        pageFournisseur.style.display = "none";
        setActiveButton(btnReconditionne);
  
        const autorise =
          fournisseurAutorisePourType(valeur, "Reconditionne") &&
          fournisseurADesMarquesPourType(valeur, lignesFournisseur, "Reconditionne");
  
        if (autorise) {
          pageFournisseur.style.display = "block";
          remplirTableFournisseur(valeur, lignesFournisseur, "Reconditionne");
          remplirFiltresFournisseur(lignesFournisseur, "Reconditionne");
        } else {
          messageFourniRec.style.display = "block";
        }
      };
    
      
      btnReparation.onclick = function () {
        hideFourniMessages();
        pageFournisseur.style.display = "none";
        setActiveButton(btnReparation);
  
        const autorise =
          fournisseurAutorisePourType(valeur, "Reparation") &&
          fournisseurADesMarquesPourType(valeur, lignesFournisseur, "Reparation");
  
        if (autorise) {
          pageFournisseur.style.display = "block";
          remplirTableFournisseur(valeur, lignesFournisseur, "Reparation");
          remplirFiltresFournisseur(lignesFournisseur, "Reparation");
        } else {
          messageFourniRep.style.display = "block";
        }
      };
  
    
      } else {
      // fournisseur inconnu
      ChoixFenêtre.style.display = "none";
      messageFournisseur.style.display = "block";
      }
    }
  });
  
  
  
  //----------------------------------------------------------------------------//
  //----------------------------------Fonctions---------------------------------//
  //----------------------------------------------------------------------------//
  
  
  //----------------------------Fonctions générales----------------------------//
  
  function hideFourniMessages() {
    messageFourniNeuf.style.display = "none";
    messageFourniRec.style.display = "none";
    messageFourniRep.style.display = "none";
  }
  
  function hideMarqueMessages() {
    messageMarqueNeuf.style.display = "none";
    messageMarqueRec.style.display = "none";
    messageMarqueRep.style.display = "none";
  }
  
  function cleanMessages(){
    messageFourniNeuf.style.display = "none";
    messageFourniRec.style.display = "none";
    messageFourniRep.style.display = "none";
    messageMarqueNeuf.style.display = "none";
    messageMarqueRec.style.display = "none";
    messageMarqueRep.style.display = "none";
    messageFournisseur.style.display = "none";
    messageMarque.style.display = "none";
  }
  
  // Fonction pour gérer l'état "actif" des boutons
  function setActiveButton(clickedButton) {
    [btnNeuf, btnReconditionne, btnReparation].forEach(btn => {
      if (btn === clickedButton) {
        btn.classList.add("active");   // bouton cliqué devient actif
      } else {
        btn.classList.remove("active"); // les autres redeviennent normaux
      }
    });
  }
  
  
  // Fonction pour prendre tous les fournisseurs associés à une marque
  
  function fournisseurMatch(item, valeur) {
    if (!item.Fournisseur || !valeur) return false;
  
    return item.Fournisseur
      .split(",")
      .map(f => f.trim().toUpperCase())
      .includes(valeur.toUpperCase());
  }
  
  
  // Vérifier si fournisseur est sous contrat ou non 
  
  function getContratFournisseur(nomFournisseur) {
    if (!data_fourniLoaded) return "NON";
  
    const ligne = data_fourni.find(
      f => f["Fournisseur"] === nomFournisseur.toUpperCase()
    );
  
    return ligne ? ligne["Contrat ?"] : "NON";
  }
  
  
  // Voir si fournisseur propose neuf rec ou rep aussi
  
  function fournisseurAutorisePourType(fournisseur, type) {
    const ligneFourni = data_fourni.find(
      f => f.Fournisseur === fournisseur.toUpperCase()
    );
  
    if (!ligneFourni) return false;
  
    if (type === "Neuf") return ligneFourni["Neuf ?"] === "OUI";
    if (type === "Reconditionne") return ligneFourni["Reconditionne ?"] === "OUI";
    if (type === "Reparation") return ligneFourni["Reparation ?"] === "OUI";
  
    return false;
  }
  
  // Voir si marque propose neuf rec ou rep aussi
  
  function marqueAutoriseePourType(marque, type) {
    return data_carto.some(item => {
      if (item.Fabriquant !== marque) return false;
  
      if (type === "Neuf") return item["Neuf ?"] === "OUI";
      if (type === "Reconditionne") return item["Reconditionne ?"] === "OUI";
      if (type === "Reparation") return item["Reparation ?"] === "OUI";
  
      return false;
    });
  }
  
  
  
  function fournisseurADesMarquesPourType(fournisseur, lignes, type) {
    return lignes.some(item => {
      let res_type = "";
      if (type === "Neuf") res_type = item["Neuf ?"];
      else if (type === "Reconditionne") res_type = item["Reconditionne ?"];
      else if (type === "Reparation") res_type = item["Reparation ?"];
  
      if (res_type !== "OUI") return false;
  
      if (!item.Fabriquant) return false;
  
      return item.Fabriquant
        .split(",")
        .map(m => m.trim().toUpperCase())
        .some(marque => marqueAutoriseePourType(marque, type));
    });
  }
  
  
  //---------------------------------Fonctions Page Marque---------------------------------//
  
  
  
  
  // Remplissage du tableau Marque
  
  function remplirTableMarque(lignes, type) {
  resultsBodyMarque.innerHTML = "";

  // Créer un tableau temporaire avec toutes les lignes
  const lignesTableau = [];

  lignes.forEach(item => {
    // Vérifier si le type demandé est OUI pour cette ligne
    let res_type = "";
    if (type === "Neuf") res_type = item["Neuf ?"];
    else if (type === "Reconditionne") res_type = item["Reconditionne ?"];
    else if (type === "Reparation") res_type = item["Reparation ?"];

    if (res_type !== "OUI") return;

    // Récupérer les fournisseurs de la ligne
    const fournisseurs = item.Fournisseur
      ? [...new Set(item.Fournisseur.split(",").map(f => f.trim().toUpperCase()))]
      : [];

    fournisseurs.forEach(fournisseur => {
      if (!fournisseurAutorisePourType(fournisseur, type)) return;
      const contratFourni = getContratFournisseur(fournisseur);

      // Stocker les données au lieu de créer directement le <tr>
      lignesTableau.push({
        fournisseur: fournisseur,
        famille: item.Famille || "",
        contrat: contratFourni
      });
    });
  });

  // Trier : d'abord par contrat (OUI avant NON), puis par ordre alphabétique
  lignesTableau.sort((a, b) => {
    // Priorité 1 : Contrat (OUI avant NON)
    if (a.contrat === 'OUI' && b.contrat !== 'OUI') return -1;
    if (a.contrat !== 'OUI' && b.contrat === 'OUI') return 1;
    
    // Priorité 2 : Ordre alphabétique du fournisseur
    return a.fournisseur.localeCompare(b.fournisseur);
  });

  // Créer les lignes du tableau dans l'ordre trié
  lignesTableau.forEach(ligne => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <a href="page_info.html?fournisseur=${encodeURIComponent(ligne.fournisseur)}" target="_blank">
          ${ligne.fournisseur}
        </a>
      </td>
      <td>${ligne.famille}</td>
      <td style="color: ${ligne.contrat === 'OUI' ? '#00EC00' : 'inherit'}">${ligne.contrat}</td>
    `;

    resultsBodyMarque.appendChild(tr);
  });
}
  
  
  
  // Remplissage des listes déroulantes pour page Marque 
  
  
  function remplirFiltresMarque(lignes, type) {
    lstFourni.innerHTML = "";
    lstFamilleM.innerHTML = "";
  
    const setFournisseurs = new Set();
    const setFamilles = new Set();
  
    lignes.forEach(item => {
      // Vérifier le type
      let res_type = "";
      if (type === "Neuf") res_type = item["Neuf ?"];
      else if (type === "Reconditionne") res_type = item["Reconditionne ?"];
      else if (type === "Reparation") res_type = item["Reparation ?"];
  
      if (res_type !== "OUI") return;
  
      // Fournisseurs
      if (item.Fournisseur) {
        item.Fournisseur
          .split(",")
          .map(f => f.trim().toUpperCase())
          .forEach(fournisseur => {
  
            if (fournisseurAutorisePourType(fournisseur, type)) {
              setFournisseurs.add(fournisseur);
            }
          });
      }
  
      // Familles
      if (item.Famille) {
        setFamilles.add(item.Famille);
      }
    });
  
    // Remplir la liste Fournisseur
    [...setFournisseurs].sort().forEach(f => {
      const option = document.createElement("option");
      option.value = f;
      option.textContent = f;
      lstFourni.appendChild(option);
    });
  
    // Remplir la liste Famille
    [...setFamilles].sort().forEach(famille => {
      const option = document.createElement("option");
      option.value = famille;
      option.textContent = famille;
      lstFamilleM.appendChild(option);
    });
  }
  
  
  
  // Filtrer le tableau selon sélection dans listes déroulantes pour page Marque
  
  function appliquerFiltresMarque() {
    const fournisseursChoisis = [...lstFourni.selectedOptions].map(o => o.value.trim().toUpperCase());
    const famillesChoisies = [...lstFamilleM.selectedOptions].map(o => o.value.trim().toUpperCase());
  
    const lignes = document.querySelectorAll("#resultsBodyMarque tr");
  
    lignes.forEach(tr => {
      const fournisseur = tr.children[0].textContent.trim().toUpperCase();
      const famille = tr.children[1].textContent.trim().toUpperCase();
  
      let visible = true;
  
      if (fournisseursChoisis.length && !fournisseursChoisis.includes(fournisseur)) {
        visible = false;
      }
  
      if (famillesChoisies.length && !famillesChoisies.includes(famille)) {
        visible = false;
      }
  
      tr.style.display = visible ? "" : "none";
    });
  }
  
  
  
  //---------------------------------Fonctions Page Fournisseur---------------------------------//
  
  
  // Remplissage du tableau Fournisseur
  
  function remplirTableFournisseur(fournisseur, lignes, type) {
  resultsBodyFourni.innerHTML = "";

  // Créer un tableau temporaire avec toutes les lignes
  const lignesTableau = [];

  lignes.forEach(item => {
    // Vérifier si le type demandé est OUI pour cette ligne
    let res_type = "";
    if (type === "Neuf") res_type = item["Neuf ?"];
    else if (type === "Reconditionne") res_type = item["Reconditionne ?"];
    else if (type === "Reparation") res_type = item["Reparation ?"];

    if (res_type !== "OUI") return; // ignore la ligne si pas OUI

    // Récupérer toutes les marques (il peut y en avoir plusieurs, séparées par ",")
    const marques = item.Fabriquant
      ? [...new Set(item.Fabriquant.split(",").map(m => m.trim()))]
      : [];

    const contratFourni = getContratFournisseur(fournisseur);
      
    // Ajouter une ligne pour chaque marque
    marques.forEach(marque => {
      if (!marqueAutoriseePourType(marque, type)) return;

      // Stocker les données au lieu de créer directement le <tr>
      lignesTableau.push({
        fournisseur: fournisseur,
        marque: marque,
        famille: item.Famille || "",
        contrat: contratFourni
      });
    });
  });

  // Trier par ordre alphabétique de la marque uniquement
  lignesTableau.sort((a, b) => a.marque.localeCompare(b.marque));

  // Créer les lignes du tableau dans l'ordre trié
  lignesTableau.forEach(ligne => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <a href="page_info.html?fournisseur=${encodeURIComponent(ligne.fournisseur)}" target="_blank">
          ${ligne.fournisseur}
        </a>
      </td>
      <td>${ligne.marque}</td>
      <td>${ligne.famille}</td>
      <td style="color: ${ligne.contrat === 'OUI' ? '#00EC00' : 'inherit'}">${ligne.contrat}</td>
    `;
    resultsBodyFourni.appendChild(tr);
  });
}
  
  
  
  // Remplissage des listes déroulantes pour page Fournisseur
  
  
  function remplirFiltresFournisseur(lignes, type) {
    lstMarque.innerHTML = "";
    lstFamilleF.innerHTML = "";
  
    const setMarques = new Set();
    const setFamilles = new Set();
  
    lignes.forEach(item => {
      // Vérifier le type
      let res_type = "";
      if (type === "Neuf") res_type = item["Neuf ?"];
      else if (type === "Reconditionne") res_type = item["Reconditionne ?"];
      else if (type === "Reparation") res_type = item["Reparation ?"];
  
      if (res_type !== "OUI") return;
  
      // Marques
      if (item.Fabriquant) {
        item.Fabriquant
          .split(",")
          .map(m => m.trim().toUpperCase())
          .forEach(marque => {
            if (marqueAutoriseePourType(marque, type)) {
              setMarques.add(marque);
            }
          });
      }
  
      // Familles
      if (item.Famille) {
        setFamilles.add(item.Famille);
      }
    });
  
    // Remplir la liste Fournisseur
    [...setMarques].sort().forEach(f => {
      const option = document.createElement("option");
      option.value = f;
      option.textContent = f;
      lstMarque.appendChild(option);
    });
  
    // Remplir la liste Famille
    [...setFamilles].sort().forEach(famille => {
      const option = document.createElement("option");
      option.value = famille;
      option.textContent = famille;
      lstFamilleF.appendChild(option);
    });
  }
  
  
  
  // Filtrer le tableau selon sélection dans listes déroulantes pour page Fournisseur
  
  function appliquerFiltresFournisseur() {
    const marquesChoisis = [...lstMarque.selectedOptions].map(o => o.value);
    const famillesChoisies = [...lstFamilleF.selectedOptions].map(o => o.value);
  
    const lignes = document.querySelectorAll("#resultsBodyFourni tr");
  
    lignes.forEach(tr => {
      const marque = tr.children[1].textContent;
      const famille = tr.children[2].textContent;
  
      let visible = true;
  
      if (marquesChoisis.length && !marquesChoisis.includes(marque)) {
        visible = false;
      }
  
      if (famillesChoisies.length && !famillesChoisies.includes(famille)) {
        visible = false;
      }
  
      tr.style.display = visible ? "" : "none";
    });
  
  }



});





