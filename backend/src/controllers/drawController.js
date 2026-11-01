export function createDrawController({ draws }) {
  return {
    getDraw(req, res) {
      res.json({ draw: draws.getDraw(req.organizer.id) });
    },

    createDraw(req, res) {
      res.status(201).json({ draw: draws.createDraw(req.organizer.id) });
    },
  };
}
