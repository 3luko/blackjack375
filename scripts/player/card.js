// card.js

class Card {
    constructor(suit, name, value) {
        this.suit = suit;
        this.name = name;
        this.value = value;
        this.imgPath = `image/${this.suit}/${this.name}.png`;
    }

    render() {
        const cardImg = document.createElement("img");
        cardImg.src = this.imgPath;
        cardImg.alt = `${this.name} of ${this.suit}`;
        cardImg.classList.add("card");
        return cardImg;
    }
}

export default Card;