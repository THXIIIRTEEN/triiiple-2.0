const allowedCors = [
    process.env.FRONTEND_URL
  ]; 

function cors(req, res, next) {
    const { origin } = req.headers;
    
    if (allowedCors.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.setHeader('Access-Control-Allow-Credentials', true);
      }
    
    next();
}

module.exports = cors;