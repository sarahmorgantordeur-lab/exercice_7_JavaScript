class Category {
    constructor(id, name, color) {
        this.id = id;       // identifiant unique
        this.name = name;   // nom de la catégorie (ex: "Travail", "Personnel")
        this.color = color; // couleur associée pour l'affichage
    }

    // Vérifie si la catégorie contient déjà une tâche du même nom (pour éviter les doublons)
    hasTaskConflict(taskText, tasks) {
        return tasks.some(task =>
            task.text.toLowerCase() === taskText.toLowerCase() &&
            task.categoryId === this.id
        );
    }
}

export default Category;
