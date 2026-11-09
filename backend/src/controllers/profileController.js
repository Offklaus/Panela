export function createProfileController({ profiles }) {
  return {
    async getProfile(req, res) {
      res.json({ profile: await profiles.getProfile(req.organizer.id) });
    },

    async saveProfile(req, res) {
      res.json({ profile: await profiles.saveProfile(req.organizer.id, req.body) });
    },
  };
}
