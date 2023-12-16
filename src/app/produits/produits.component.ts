import { Component, OnInit } from '@angular/core';
import { Produit } from '../model/produit';
import { NgForm } from '@angular/forms';
import { ProduitsService } from '../services/produits.service';
import { Categorie } from '../model/categorie';

@Component({
  selector: 'app-produits',
  templateUrl: './produits.component.html',
  styleUrls: ['./produits.component.css']
})
export class ProduitsComponent implements OnInit {
  categories: Array<Categorie> = [];
  produitCourant = new Produit();

  editMode: boolean = false;

  constructor(private produitsService: ProduitsService) {}

  ngOnInit(): void {
    console.log("Initialisation du composant...");
    this.consulterProduits();
    this.consulterCategories();
  }

  mettreAJourProduit(nouveau: Produit, ancien: Produit) {
    this.produitsService.updateProduit(nouveau.id, nouveau).subscribe({
      next: updatedProduit => {
        console.log("Succès PUT");
        Object.assign(ancien, nouveau);
        console.log('Mise à jour du produit : ' + ancien.designation);
      },
      error: err => {
        console.error("Erreur PUT:", err);
      }
    });
  }

  ajouterProduit(nouveau: Produit) {
    this.produitsService.addProduit(nouveau).subscribe({
      next: addedProduit => {
        console.log("Succès POST");
        this.produits.push(nouveau);
        console.log("Ajout d'un nouveau produit : " + nouveau.designation);
      },
      error: err => {
        console.error("Erreur POST:", err);
      }
    });
  }

  supprimerProduit(id: number | undefined) {
    if (id) {
      this.produitsService.deleteProduit(id)
        .subscribe(
          {
            next: () => {
              console.log("Produit supprimé avec succès.");
              // Refresh the list of products after deletion
              this.consulterProduits();
            },
            error: err => {
              console.log("Erreur lors de la suppression du produit.");
            }
          }
        );
    }
  }

  validerFormulaire(produitForm: any) {
    if (produitForm.value.id !== undefined) {
      const existingProduct = this.produits.find(p => p.id === produitForm.value.id);

      if (existingProduct) {
        const confirmation = confirm("Produit existant. Confirmez-vous la mise à jour de : " + existingProduct.designation + "?");

        if (confirmation) {
          Object.assign(existingProduct, produitForm.value);
          existingProduct.categorie = this.categories.find(cat => cat.id === produitForm.value.categorie.id);
          this.mettreAJourProduit(produitForm.value, existingProduct);
        } else {
          console.log("Mise à jour annulée");
        }
        return;
      }
    }

    this.ajouterProduit(produitForm.value);
  }

  effacerSaisie(produitForm: NgForm) {
    this.produitCourant = new Produit();
    produitForm.resetForm();
  }

  eediterProduit(produit: any) {
    this.produitCourant = { ...produit };
    this.produitCourant.categorie = this.categories.find(cat => cat.id === produit.categorie.id);
    this.editMode = true;
  }
  
  
  annulerEdition() {
    this.editMode = false; 
    this.produitCourant = new Produit();
  }
  
  produits: Produit[] = [];

  consulterProduits() {
    console.log("Début de la récupération des produits...");
    this.produitsService.getProduits().subscribe({
      next: (produits: Produit[]) => {
        console.log("Produits récupérés avec succès:", produits);
        this.produits = [];
        produits.forEach((produit: Produit) => {
          this.produits.push(produit);
        });
      },
      error: (err: any) => {
        console.error("Erreur lors de la récupération des produits :", err);
      }
    });
  }
  

  
  consulterCategories() {
    this.produitsService.getCategories().subscribe({
      next: (categories: Categorie[]) => {
        this.categories = categories;
        console.log("Catégories récupérées avec succès:", categories);
      },
      error: (err: any) => {
        console.error("Erreur lors de la récupération des catégories :", err);
      }
    });
  }
}
