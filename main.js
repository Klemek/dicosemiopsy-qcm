function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}


let app = {
    data() {
        return {
            data: [{ name: 'loading', description: 'loading' }],
            score: 0,
            question: 0,
            answers: [
                { id: 0, clicked: false },
                { id: 0, clicked: false },
                { id: 0, clicked: false },
                { id: 0, clicked: false },
            ],
            show_results: false,
        };
    },
    computed: {
        currentYear() {
            return new Date().getFullYear();
        },
    },
    methods: {
        showApp(data) {
            this.data = data;
            document.getElementById('app').setAttribute('style', '');
            this.newQuestion();
        },
        click(i) {
            if (!this.show_results) {
                this.answers[i].clicked = true;
                if (this.answers[i].id == this.question) {
                    this.score += 1;
                } else {
                    this.score = 0;
                }
            } else {
                this.newQuestion();
            }

            this.show_results = !this.show_results;
        },
        getRandomDataIndex() {
            return Math.floor(Math.random() * this.data.length)
        },
        newQuestion() {
            this.question = this.getRandomDataIndex();
            const ids = [this.question];
            for (let i = 0; i < 3; i++) {
                let candidate = this.getRandomDataIndex();
                while (ids.includes(candidate)) {
                    candidate = this.getRandomDataIndex();
                }
                ids.push(candidate);
            }
            this.answers = shuffle(ids.map(id => {
                return {
                    id: id, clicked: false
                };
            }));
        },
    },
    mounted: function () {
        console.log('app mounted');

        fetch("data.json")
            .then(response => response.json())
            .then(this.showApp);
    },
};

window.onload = () => {
    app = Vue.createApp(app);
    app.mount('#app');
};
