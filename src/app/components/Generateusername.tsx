export function generateAnimalUsername() {
    const animals = [
        "lion", "tiger", "wolf", "eagle", "falcon", "panda", "bear", "shark",
        "leopard", "fox", "owl", "rhino", "cobra", "jaguar", "gorilla"
    ];

    const randomAnimal = animals[Math.floor(Math.random() * animals.length)];

    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const shortId = array[0].toString(16).slice(0, 4);

    return `${randomAnimal}_${shortId}`;
}
