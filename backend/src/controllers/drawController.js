export function createDrawController({ draws }) {
  return {
    async getDraw(req, res) {
      res.json({ draw: await draws.getDraw(req.organizer.id) });
    },

    async createDraw(req, res) {
      res.status(201).json({ draw: await draws.createDraw(req.organizer.id) });
    },
  };
}
