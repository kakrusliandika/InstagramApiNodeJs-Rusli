const axios = require('axios');

module.exports = async (req, res) => {
  const { username } = req.query;
  if (!username) return res.status(400).json({ error: 'Username is required' });

  try {
    const response = await axios.get(`https://www.instagram.com/api/v1/users/web_profile_info/`, {
      params: { username },
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'X-IG-App-ID': '936619743392459' // Optional header
      }
    });

    const user = response.data.data.user;
    const edges = user.edge_owner_to_timeline_media.edges;

    const posts = edges.map((edge) => ({
      imageUrl: edge.node.display_url,
      caption: edge.node.edge_media_to_caption.edges[0]?.node.text || '',
      timestamp: edge.node.taken_at_timestamp,
    }));

    res.status(200).json(posts.slice(0, 12)); // Batasi 12 post saja
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch data from Instagram' });
  }
};
