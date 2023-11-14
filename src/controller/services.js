const services = require("../helper/sevice")
const cheerio = require("cheerio")
const baseUrl = require("../constant/url")
const origin = "https://otakudesu.cam"
const episodeHelper = require("../helper/episodeHelper")
const endUrl = "_x_tr_sl=auto&_x_tr_tl=null"

const Services = {
    getOngoing: async (req, res) => {
        const page = req.params.page
        let url = page === 1 ? `${baseUrl}/ongoing-anime/` : `${baseUrl}/ongoing-anime/page/${page}/`
        try {
            const response = await services.fetchService(url+`?${endUrl}`, res)
            if (response.status === 200) {
                const $ = cheerio.load(response.data)
                const element = $(".rapi")
                let ongoing = []
                let title, thumb, total_episode, updated_on, updated_day, endpoint
    
                element.find("ul > li").each((index, el) => {
                    title = $(el).find("h2").text().trim().replace(/\s+/g," ")
                    thumb = $(el).find("img").attr("src")
                    total_episode = $(el).find(".epz").text().replace(/\n\s+/g,"")
                    updated_on = $(el).find(".newnime").text().replace(/\n\s+/g,"")
                    updated_day = $(el).find(".epztipe").text().replace(/\n\s+/g,"")
                    endpoint = $(el).find(".thumb > a").attr("href").replace(`${baseUrl}/anime/`, "").replace("/", "").split("?",1).join()
    
                    ongoing.push({
                        title,
                        thumb,
                        total_episode,
                        updated_on,
                        updated_day,
                        endpoint,
                    })
                })
                return res.status(200).json({
                    status: true,
                    ozip: "ozip",
                    message: "success",
                    ongoing,
                    currentPage: page
                })
            }
            return res.send({
                message: response.status,
                ongoing: [],
            });
        } catch (error) {
            console.log(error);
            res.send({
                status: false,
                message: error,
                ongoing: [],
            });
        }
    },
    getCompleted: async (req, res) => {
        const page = req.params.page
        let url = page === 1 ? `${baseUrl}/complete-anime/` : `${baseUrl}/complete-anime/page/${page}/`
    
        try {
            const response = await services.fetchService(url+`?${endUrl}`, res)
            if (response.status === 200) {
                const $ = cheerio.load(response.data)
                const element = $(".rapi")
                let completed = []
                let title, thumb, total_episode, updated_on, score, endpoint
    
                element.find("ul > li").each((index, el) => {
                    title = $(el).find("h2").text().trim().replace(/\s+/g," ")
                    thumb = $(el).find("img").attr("src")
                    total_episode = $(el).find(".epz").text().replace(/\n\s+/g,"")
                    updated_on = $(el).find(".newnime").text().replace(/\n\s+/g,"")
                    score = $(el).find(".epztipe").text().trim().replace(/\n\s+/g,"")
                    endpoint = $(el).find(".thumb > a").attr("href").replace(`${baseUrl}/anime/`, "").replace("/", "").split("?",1).join()
    
                    completed.push({
                        title,
                        thumb,
                        total_episode,
                        updated_on,
                        score,
                        endpoint,
                    })
                })
    
                return res.status(200).json({
                    status: true,
                    message: "success",
                    completed,
                    currentPage: page
                })
            }
            return res.send({
                status: response.status,
                completed: []
            })
        } catch (error) {
            console.log(error)
            res.send({
                status: false,
                message: error,
                completed: [],
            });
        }
    },
    getSearch: async (req, res) => {
        const query = req.params.q
        let url = `${baseUrl}/?s=${query}&post_type=anime&_x_tr_sl=auto&_x_tr_tl=null`
        try {
            const response = await services.fetchService(url, res)
            if (response.status === 200) {
                const $ = cheerio.load(response.data)
                const element = $(".page")
                let search = []
                let title, thumb, genres, status, rating, endpoint
    
                element.find("li").each((index, el) => {
                    title = $(el).find("h2 > a").text().replace(/\n\s+/g,"")
                    thumb = $(el).find("img").attr("src")
                    genres = $(el).find(".set > a").text().match(/[A-Z][a-z]+/g)
                    status = $(el).find(".set").text().match("Ongoing") || $(el).find(".set").text().match("Completed")
                    rating = $(el).find(".set").text().replace(/^\D+/g, '').replace(/\n\s+/g,"") || null
                    endpoint = $(el).find("h2 > a").attr("href").replace(`${baseUrl}/anime/`, "").replace("/", "").split("?",1).join()
    
                    search.push({
                        title,
                        thumb,
                        genres,
                        status,
                        rating,
                        endpoint,
                    })
                })
                return res.status(200).json({
                    status: true,
                    message: "success",
                    search,
                    query
                })
            }
            return res.send({
                message: response.status,
                search: [],
            });
        } catch (error) {
            console.log(error);
            res.send({
                status: false,
                message: error,
                search: [],
            });
        }
    },
    getAnimeList: async (req, res) => {
        let url = `${baseUrl}/anime-list/`
        try {
            const response = await services.fetchService(url+`?${endUrl}`, res)
            if (response.status === 200) {
                const $ = cheerio.load(response.data)
                const element = $("#abtext")
                let anime_list = []
                let title, endpoint
    
                element.find(".jdlbar").each((index, el) => {
                    title = $(el).find("a").text().replace(/\n\s+/g,"") || null
                    endpoint = $(el).find("a").attr("href").replace(`${baseUrl}/anime/`, "").replace("/", "").split("?",1).join()
    
                    anime_list.push({
                        title,
                        endpoint
                    })
                })
    
                // filter null title
                const datas = anime_list.filter((value) => value.title !== null)
    
                return res.status(200).json({
                    status: true,
                    message: "success",
                    anime_list: datas
                })
            }
            return res.send({
                message: response.status,
                anime_list: [],
            });
        } catch (error) {
            console.log(error);
            res.send({
                status: false,
                message: error,
                anime_list: [],
            });
        }
    },
    getAnimeDetail: async (req, res) => {
        const endpoint = req.params.endpoint
        let url = `${baseUrl}/anime/${endpoint}/`
    
        try {
            const response = await services.fetchService(url+`?${endUrl}`, res)
            if (response.status === 200) {
                const $ = cheerio.load(response.data)
                const infoElement = $(".fotoanime")
                const episodeElement = $(".episodelist")
                let anime_detail = {}
                let episode_list = []
                let thumb, sinopsis = [], detail = [], episode_title, episode_endpoint, episode_date, title
    
                infoElement.each((index, el) => {
                    thumb = $(el).find("img").attr("src")
                    $(el).find(".sinopc > p").each((index, el) => {
                        sinopsis.push($(el).text())
                    })
                    $(el).find(".infozingle >  p").each((index, el) => {
                        detail.push($(el).text())
                    })
    
                    anime_detail.thumb = thumb
                    anime_detail.sinopsis = sinopsis
                    anime_detail.detail = detail
                })
    
                title = $(".jdlrx > h1").text()
                anime_detail.title = title
    
                episodeElement.find("li").each((index, el) => {
                    episode_title = $(el).find("span > a").text()
                    episode_endpoint = $(el).find("span > a").attr("href").replace(`/episode/`, "").replace(`/batch/`, "").replace(`/lengkap/`, "").replace(baseUrl,'').replace("/", "").split("?",1).join()
                    episode_date = $(el).find(".zeebr").text().replace(/\n\s+/g,"")
    
                    episode_list.push({
                        episode_title,
                        episode_endpoint,
                        episode_date
                    })
                })
    
                return res.status(200).json({
                    status: true,
                    message: "success",
                    anime_detail,
                    episode_list,
                    endpoint
                })
            }
            res.send({
                message: response.status,
                anime_detail: [],
                episode_list: []
            });
        } catch (error) {
            console.log(error);
            res.send({
                status: false,
                message: error,
                anime_detail: [],
                episode_list: []
            });
        }
    },
    getEmbedByContent: async(req, res) => {
        try {
            let nonce = await episodeHelper.getNonce();
            let content = req.params.content 

            const html_streaming = await episodeHelper.getUrlAjax(content, nonce)
            const parse = cheerio.load(html_streaming)
            const link = parse('iframe').attr('src')
            const obj = {};
            obj.streaming_url = link

            res.send(obj);
        } catch (err) {
            console.log(err);
            res.send(err)
        }
    },
    getAnimeEpisode: async (req, res) => {
        const endpoint = req.params.endpoint;
        const url = `${baseUrl}/episode/${endpoint}`;

        try {
            const response = await services.fetchService(url+`?${endUrl}`, res);
            const $ = cheerio.load(response.data);
            const streamElement = $("#lightsVideo").find("#embed_holder");
            const obj = {};
            obj.title = $(".venutama > h1").text();
            obj.baseUrl = url;
            obj.id = url.replace(url.baseUrl, "").replace(`/anime/`, "").replace(`/episode/`, "").replace(baseUrl,"").replace("/", "").split("?",1).join();
            obj.streamLink = streamElement.find(".responsive-embed-stream > iframe").attr("src");
            obj.relative = []
            let link_ref, title_ref
            $(".flir > a").each((index, el) => {
                title_ref = $(el).text()
                link_ref = $(el).attr("href").replace(`/anime/`, "").replace(`/episode/`, "").replace(baseUrl,"").replace("/", "").split("?",1).join()
    
                obj.relative.push({
                    title_ref,
                    link_ref
                })
            })
            
            obj.list_episode = []
            let list_episode_title, list_episode_endpoint
            $("#selectcog > option").each((index, el) => {
                list_episode_title = $(el).text()
                list_episode_endpoint = $(el).attr("value").replace(`/episode/`, "").replace(origin,"").replace("/", "").split("?",1).join()
                obj.list_episode.push({
                    list_episode_title,
                    list_episode_endpoint
                })
            })
            obj.list_episode.shift()
            const streamLinkResponse = streamElement.find("iframe").attr("src");
            obj.link_stream_response = await episodeHelper.get(streamLinkResponse);
           
            
            let streaming1 = [];
            let streaming2 = [];
            let streaming3 = [];

            $('#embed_holder > div.mirrorstream > ul.m360p > li').each((k, v) => {               
                let driver = $(v).text()

                streaming1.push({
                    driver: driver,
                    link: "/api/v1/streaming/" + $(v).find('a').data().content
                });
            })


            $('.mirrorstream > .m480p > li').each(async(k, v) => {               
                let driver = $(v).text()

                streaming2.push({
                    driver: driver,
                    link: "/api/v1/streaming/" + $(v).find('a').data().content
                });
            })

            $('.mirrorstream > .m720p > li').each(async(k, v) => {               
                let driver = $(v).text()

                streaming3.push({
                    driver: driver,
                    link: "/api/v1/streaming/" + $(v).find('a').data().content
                });
            })

            obj.mirror_embed1 = { quality: '360p', straming: streaming1 };
            obj.mirror_embed2 = { quality: '480p', straming: streaming2 };
            obj.mirror_embed3 = { quality: '720p', straming: streaming3 };

            let low_quality;
            let medium_quality;
            let high_quality;

            if ($('#venkonten > div.venser > div.venutama > div.download > ul > li:nth-child(1)').text() === '') {
                low_quality = episodeHelper.notFoundQualityHandler(response.data, 0)
                medium_quality = episodeHelper.notFoundQualityHandler(response.data, 1)
                high_quality = episodeHelper.notFoundQualityHandler(response.data, 2)
            } else {
                low_quality = episodeHelper.epsQualityFunction(0, response.data);
                medium_quality = episodeHelper.epsQualityFunction(1, response.data);
                high_quality = episodeHelper.epsQualityFunction(2, response.data);
            }
            obj.quality = { low_quality, medium_quality, high_quality };
            res.send(obj);
        } catch (err) {
            console.log(err);
        }
    },
    getBatchLink: async (req, res) => {
        const endpoint = req.params.endpoint;
        const fullUrl = `${baseUrl}/batch/${endpoint}`;
        console.log(fullUrl);
        try {
            const response = await services.fetchService(fullUrl+`?${endUrl}`, res)
            const $ = cheerio.load(response.data);
            const batch = {};
            batch.title = $(".batchlink > h4").text();
            batch.status = "success";
            batch.baseUrl = fullUrl;
            let low_quality = episodeHelper.batchQualityFunction(0, response.data);
            let medium_quality = episodeHelper.batchQualityFunction(1, response.data);
            let high_quality = episodeHelper.batchQualityFunction(2, response.data);
            batch.download_list = { low_quality, medium_quality, high_quality };
            res.send({
                status: true,
                message: "succes",
                batch
            });
        } catch (error) {
            console.log(error)
        }
    },
    getGenreList: async (req, res) => {
        const url = `${baseUrl}/genre-list/`
        try {
            const response = await services.fetchService(url+`?${endUrl}`, res)
            if (response.status === 200) {
                const $ = cheerio.load(response.data)
                let genres = [], genre, endpoint
                $('.genres').find("a").each((index, el) => {
                    genre = $(el).text()
                    endpoint = $(el).attr('href').replace(baseUrl,"").replace("/genres/", "").replace("/", "").split("?",1).join()
        
                    genres.push({
                        genre,
                        endpoint
                    })
                })
                return res.status(200).json({
                    status: true,
                    message: 'success',
                    genres
                })
            }
            res.send({
                message: response.status,
                genres: []
            })
        } catch (error) {
            console.log(error);
            res.send({
                status: false,
                message: error,
                genres: []
            });
        }
    },
    getGenrePage: async (req, res) => {
        const genre = req.params.genre
        const page = req.params.page
        const url = page === 1 ? `${baseUrl}/genres/${genre}` : `${baseUrl}/genres/${genre}/page/${page}`
        
        try {
            const response = await services.fetchService(url+`?${endUrl}`, res)
    
            if (response.status === 200) {
                const $ = cheerio.load(response.data)
                let genreAnime = [], title, link, studio, episode, rating, thumb, season, sinopsis, genre
                $('.col-anime-con').each((index, el) => {
                    title = $(el).find(".col-anime-title > a").text().replace(/\n\s+/g,"")
                    link = $(el).find(".col-anime-title > a").attr("href").replace(`${baseUrl}/anime/`, "").split("?",1).join()
                    studio = $(el).find(".col-anime-studio").text().replace(/\n\s+/g,"")
                    episode = $(el).find(".col-anime-eps").text().replace(/\n\s+/g,"")
                    rating = $(el).find(".col-anime-rating").text().replace(/\n\s+/g,"") || null
                    thumb = $(el).find(".col-anime-cover > img").attr("src")
                    season = $(el).find(".col-anime-date").text().replace(/\n\s+/g,"")
                    sinopsis = $(el).find(".col-synopsis").text().replace(/\n\s+/g,"")
                    genre = $(el).find(".col-anime-genre").text().trim().split(",")
    
                    genreAnime.push({
                        title,
                        link,
                        studio,
                        episode,
                        rating,
                        thumb,
                        genre,
                        sinopsis
                    })
                })
                return res.status(200).json({
                    status: true,
                    message: "success",
                    genreAnime
                })
            }
            return res.send({
                message: response.status,
                genreAnime: []
            })
        } catch (error) {
            console.log(error)
            res.send({
                status: false,
                message: error,
                genreAnime: []
            })
        }
    }
}

module.exports = Services
