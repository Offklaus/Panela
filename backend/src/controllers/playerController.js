export function createPlayerController({ roster }) {
  return {
    getRoster(req, res) {
      res.json(roster.getRosterState(req.organizer.id));
    },

    addPlayer(req, res) {
      res.status(201).json(roster.addPlayer(req.organizer.id, req.body));
    },

    updatePlayer(req, res) {
      res.json(roster.updatePlayer(req.organizer.id, req.params.id, req.body));
    },

    removePlayer(req, res) {
      res.json(roster.removePlayer(req.organizer.id, req.params.id));
    },

    setAllPresence(req, res) {
      res.json(roster.setAllPresent(req.organizer.id, req.body));
    },
  };
}
