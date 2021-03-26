const express = require('express');
const router = express.Router();

const developer_con = require('../controllers/developer_controller');
const game_con = require('../controllers/game_controller');
const genre_con = require('../controllers/genre_controller');
const publisher_con = require('../controllers/publisher_controller');
const user_con = require('../controllers/user_controller');
const forum_con = require('../controllers/forum_controller');

router.get('/', game_con.game_list);
router.get('/dashboard', game_con.gamestore_dashboard);

router.get('/login', user_con.login_get);
router.post('/login', user_con.login_post);

router.get('/signup', user_con.signup_get);
router.post('/signup', user_con.signup_post);

router.get('/forum', forum_con.forum_index);
router.post('/forum', forum_con.create_forum_post);

router.get('/forum/:id', forum_con.post_detail);

router.get('/game', game_con.game_list);

router.get('/game/create', game_con.game_create_get);
router.post('/game/create', game_con.game_create_post);

router.get('/game/:id/', game_con.game_detail);

router.get('/game/:id/update', game_con.game_update_get);
router.post('/game/:id/update', game_con.game_update_post);

router.get('/game/:id/delete', game_con.game_delete_get);
router.post('/game/:id/delete', game_con.game_delete_post);

router.get('/developer', developer_con.developer_list);


router.get('/developer/create', developer_con.developer_create_get);
router.post('/developer/create', developer_con.developer_create_post);

router.get('/developer/:id/', developer_con.developer_detail);

router.get('/developer/:id/update', developer_con.developer_update_get);
router.post('/developer/:id/update', developer_con.developer_update_post);

router.get('/developer/:id/delete', developer_con.developer_delete_get);
router.post('/developer/:id/delete', developer_con.developer_delete_post);

router.get('/publisher', publisher_con.publisher_list);


router.get('/publisher/create', publisher_con.publisher_create_get);
router.post('/publisher/create', publisher_con.publisher_create_post);

router.get('/publisher/:id/', publisher_con.publisher_detail);

router.get('/publisher/:id/update', publisher_con.publisher_update_get);
router.post('/publisher/:id/update', publisher_con.publisher_update_post);

router.get('/publisher/:id/delete', publisher_con.publisher_delete_get);
router.post('/publisher/:id/delete', publisher_con.publisher_delete_post);

router.get('/genre', genre_con.genre_list);

router.get('/genre/create', genre_con.genre_create_get);
router.post('/genre/create', genre_con.genre_create_post);

router.get('/genre/:name/', genre_con.genre_detail);

router.get('/genre/:id/update', genre_con.genre_update_get);
router.post('/genre/:id/update', genre_con.genre_update_post);

router.get('/genre/:id/delete', genre_con.genre_delete_get);
router.post('/genre/:id/delete', genre_con.genre_delete_post);

module.exports = router;

