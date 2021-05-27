const axios = require('axios');
const HTMLParser = require('node-html-parser');
const Url = require('url-parse');

const ALL_PROTEINS = ['chicken', 'beef', 'veggie', 'fish', 'salmon', 'shrimp'];

class WebScrape {

    static proteinFromName(name) {

        let lowerNameArray = name.toLowerCase().split(' ');
        lowerNameArray.map((word) => word.trim());


        let protein = null;
        
        for (let i = 0; i < ALL_PROTEINS.length; i++) {
            const proteinName = ALL_PROTEINS[i];
            if (lowerNameArray.includes(proteinName)) {
                protein = proteinName;
                break;
            }
        };

        return protein;
    }

    static async getRecipeData(url) {
        const parsedUrl = new Url(url);

        let result;

        switch (parsedUrl.hostname) {
            case 'cooking.nytimes.com':
                result = this.nyTimes(url);
                break;
            case 'www.allrecipes.com':
                result = this.allRecipes(url);
                break;
            default:
                throw Error('Recipe domain not supported')
        }

        return result;
    }

    static async allRecipes(url) {
        const response = await axios.get(url);
        const root = HTMLParser.parse(response.data);
        const data = JSON.parse(root.querySelector('script').rawText)[1];

        const name = data.name;
        const protein = this.proteinFromName(name);

        return {
            url,
            image_url: data.image.url,
            name,
            protein
        };
    }

    static async nyTimes(url) {


        const response = await axios.get(url);
        const root = HTMLParser.parse(response.data);

        const name = root.querySelector('.recipe-title').rawText.trim()
        const image_url = root.querySelector('.recipe-intro .media-container picture img').attributes.src
        const protein = this.proteinFromName(name);

        return {
            url,
            image_url,
            name,
            protein
        };
    }
}