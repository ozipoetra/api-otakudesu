const { default: Axios } = require("axios");

const Service = {
    fetchService: async (url, res) => {
        try {
            const response = await Axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 13; Redmi Note 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Mobile Safari/537.36'
                }
                })
            return new Promise((resolve, reject) => {
                if (response.status === 200) resolve(response)
                reject(response)
            })
        } catch (error) {
            res.send({
                status: false,
                code: 404,
                message: "Bad Request"
            })
            throw error
        }
    }
}

module.exports = Service
