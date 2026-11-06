export function createPlayerController({ roster }) {
  return {
    async getRoster(req, res) {
      res.json(await roster.getRosterState(req.organizer.id));
    },

    async addPlayer(req, res) {
      res.status(201).json(await roster.addPlayer(req.organizer.id, req.body));
    },

    async updatePlayer(req, res) {
      res.json(await roster.updatePlayer(req.organizer.id, req.params.id, req.body));
    },

    async removePlayer(req, res) {
      res.json(await roster.removePlayer(req.organizer.id, req.params.id));
    },

    async setAllPresence(req, res) {
      res.json(await roster.setAllPresent(req.organizer.id, req.body));
    },
  };
}
