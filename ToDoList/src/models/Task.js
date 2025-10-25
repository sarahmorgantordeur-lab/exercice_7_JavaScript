class Task {
    constructor(id, userId, text, done = false, createdAt = new Date()) {
        this.id = id;          // identifiant unique
        this.userId = userId;  // utilisateur auquel appartient la tâche
        this.text = text;      // contenu de la tâche
        this.done = done;      // état (faite / à faire)
        this.createdAt = createdAt; // date de création
    }

    // Crée une nouvelle tâche avec un id unique et la date actuelle
    static create(userId, text) {
        const id = Date.now().toString();
        return new Task(id, userId, text, false, new Date());
    }

    // Vérifie si la tâche est ancienne (créée il y a plus d’un jour par ex.)
    isPast() {
        const now = new Date();
        const diff = now - new Date(this.createdAt);
        return diff > 24 * 60 * 60 * 1000; // plus de 24h
    }

    // Retourne une date lisible (ex: "lundi 13 octobre 2025")
    getFormattedDate() {
        const dateObj = new Date(this.createdAt);
        return dateObj.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

export default Task;
