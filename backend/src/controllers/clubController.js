export function createClubController({ clubs }) {
  return {
    async getClub(req, res) {
      res.json({ club: await clubs.getClub(req.organizer.id) });
    },

    async createClub(req, res) {
      res.status(201).json({ club: await clubs.createClub(req.organizer.id, req.body) });
    },
  };
}