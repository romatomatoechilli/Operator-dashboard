const STORAGE_KEY = "multitasked_games";


function saveGames(games) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(games)
    );

}


function loadGames() {

    const savedGames =
        localStorage.getItem(STORAGE_KEY);

    if (!savedGames) {
        return null;
    }

    return JSON.parse(savedGames);

}


function clearGames() {

    localStorage.removeItem(STORAGE_KEY);

}