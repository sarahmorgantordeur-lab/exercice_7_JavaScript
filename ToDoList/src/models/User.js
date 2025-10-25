class User {
    constructor(id, userId, text, done = false, createdAt = new Date().toISOString()) {
        this.id = id;
        this.userId = userId; // identifiant de l’utilisateur à qui appartient la tâche
        this.text = text;     // contenu de la tâche
        this.done = done;     // état : terminée ou non
        this.createdAt = createdAt; // date de création
    }

    // méthode statique pour créer une nouvelle tâche
    static create(userId, text) {
        const id = Date.now().toString();
        const createdAt = new Date().toISOString();
        return new Task(id, userId, text, false, createdAt);
    }

    // permet de marquer une tâche comme terminée ou non
    toggle() {
        this.done = !this.done;
    }

    // utile si tu veux permettre l’édition du texte
    updateText(newText) {
        this.text = newText.trim();
    }
}

export default User;
