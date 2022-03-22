const sum = (...args) => args.reduce((acc, n) => acc + n, 0)
const zeroOrOne = () => Math.random() > 0.5 ? 1 : 0;

const generateGenes = (length) => Array.from({ length }, () => zeroOrOne())

class Individual {
    constructor(genes) {
        this.genes = genes;
        this.cost = sum(...this.genes);
    }

    crossOver(individual) {
        const max = Math.floor(this.genes.length / 2);
        const firstPart = this.genes.slice(0, max);
        const lastPart = individual.genes.slice(max);
        const genes = firstPart.concat(lastPart);

        if (genes.length !== this.genes.length) {
            throw new Error(`Individual crossOver genes length not equal. Original got "${this.genes.length}", crossOver got "${genes.length}".`);
        }

        return new Individual(genes);
    }

    mutate(probability) {
        if (Math.random() > probability) {
            return;
        }

        const randomIndex = Math.floor(Math.random() * this.genes.length);
        this.genes[randomIndex] = zeroOrOne();
        this.cost = sum(...this.genes);
    }
}

class Population {

    constructor(solution) {
        this.individuals = [];
        this.size = 0;
        this.solution = solution;
    }

    load(size) {
        this.size = size;
        while (size--) {
            this.individuals.push(new Individual(generateGenes(this.solution.genes.length)))
        }
    }

    sort() {
        this.individuals.sort((a, b) => b.cost - a.cost);
        // always limit the array to this.size
        this.individuals.splice(this.size, this.individuals.length);
    }

    selection() {
        // 2/3 of individuals the more adapted to the environment
        const max = Math.min((this.individuals.length * 2) / 3, this.size);
        this.individuals.splice(max, this.individuals.length);
    }

    crossOver() {
        const maxIndex = this.individuals.length / 2;
        for (let i = 0; i < maxIndex; i++) {
            let random = i;

            while (random === i) {
                random = Math.floor(Math.random() * maxIndex);
            }

            const individual = this.individuals[i];
            const randomIndividual = this.individuals[random];

            this.individuals.push(individual.crossOver(randomIndividual));
        }
    }

    mutate() {
        for(let i = 0; i < this.individuals.length; i++) {
            const individual = this.individuals[i];
            individual.mutate(0.5);

            if (individual.cost === this.solution.cost) {
                this.sort();
                return true;
            }
        }
        return false;
    }
}

class Generation {
    constructor({
        populationSize,
        solution
    }) {
        this.count = 0;
        this.population = new Population(solution);
        this.population.load(populationSize);
    }

    new() {
        this.count++;
        this.population.sort();
        this.population.selection();
        this.population.crossOver();

        if (this.population.mutate()) {
            return;
        }

        this.new();
    }
}

const generation = new Generation({
    populationSize: 250,
    solution: new Individual([1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1])
})

console.time('Genetic Algorithm');
generation.new();
console.timeEnd('Genetic Algorithm');

console.log('[FINAL REPORT]')
console.log(`NUMBER OF GENERATION: ${generation.count}`)
console.log(`SOLUTION GENES: ${generation.population.solution.genes.join('')}`)
console.log(`FOUND INDIVIDUAL GENES: ${generation.population.individuals[0].genes.join('')}`)

