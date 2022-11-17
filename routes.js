const express = require('express')
const axios = require("axios");
let app = express.Router()

app.get('/', (req, res) => {
    var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress 
    console.log(`Connection from ${ip}`)
    res.send('It is working!')
});

app.get('/posts', (req, res) => {
    let endpoints = [
        'https://jsonplaceholder.typicode.com/posts',
        'https://jsonplaceholder.typicode.com/comments'
    ];

    axios.all(endpoints.map((endpoint) => axios.get(endpoint))).then(
        axios.spread(({data: posts}, {data: comments}) => {
            const merged = posts.map(item => ({
                post_id: item.id,
                post_title: item.title,
                post_body: item.body,
                total_number_of_comments: comments.filter(comment => comment.postId === item.id).length
            }))

            merged.sort((postA, postB) => {
                return postB.total_number_of_comments - postA.total_number_of_comments
            })

            res.send(merged)
        })
    );

});

app.get('/comments', (req, res) => {
    const getComments = async () => {
        const { data } = await axios.get("https://jsonplaceholder.typicode.com/comments");
        const queries = req.query;
        const filteredData = data.filter(comment => {
            let isValid = true;
            for (key in queries) {
              isValid = isValid && comment[key] == queries[key];
            }
            return isValid;
        });
        res.send(filteredData);
    }
    getComments();
});

module.exports = app;