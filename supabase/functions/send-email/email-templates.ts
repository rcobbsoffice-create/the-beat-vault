// Email templates for AudioGenes

export const templates = {
  purchase_confirmation: (data: {
    buyer_name: string
    beat_title: string
    license_type: string
    download_url: string
    amount: string
  }) => ({
    subject: `Your purchase of "${data.beat_title}" is ready!`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎵 Purchase Confirmed!</h1>
    </div>
    <div class="content">
      <p>Hey ${data.buyer_name},</p>
      <p>Your purchase is complete! Here are your details:</p>
      <ul>
        <li><strong>Beat:</strong> ${data.beat_title}</li>
        <li><strong>License:</strong> ${data.license_type}</li>
        <li><strong>Amount:</strong> ${data.amount}</li>
      </ul>
      <p style="text-align: center;">
        <a href="${data.download_url}" class="button">Download Your Files</a>
      </p>
      <p><small>This link expires in 7 days. Make sure to download your files!</small></p>
    </div>
    <div class="footer">
      <p>© AudioGenes | Making music accessible</p>
    </div>
  </div>
</body>
</html>
    `,
  }),

  welcome_producer: (data: { producer_name: string, store_url: string }) => ({
    subject: 'Welcome to the AudioGenes Producer Program! 🎹',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1a1a2e; color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .button { display: inline-block; background: #e94560; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome, ${data.producer_name}! 🎉</h1>
    </div>
    <div class="content">
      <p>You're now part of the AudioGenes producer community!</p>
      <h3>Next Steps:</h3>
      <ol>
        <li>Complete your Stripe onboarding to receive payments</li>
        <li>Customize your storefront</li>
        <li>Upload your first beat</li>
        <li>Share your store link with your audience</li>
      </ol>
      <p style="text-align: center;">
        <a href="${data.store_url}" class="button">Visit Your Storefront</a>
      </p>
    </div>
  </div>
</body>
</html>
    `,
  }),

  new_sale: (data: {
    producer_name: string
    beat_title: string
    buyer_email: string
    amount: string
    dashboard_url: string
  }) => ({
    subject: `💰 New Sale: "${data.beat_title}"`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: sans-serif; padding: 20px;">
  <h2>New Sale Alert! 💰</h2>
  <p>Hey ${data.producer_name},</p>
  <p>Great news! Someone just purchased your beat:</p>
  <ul>
    <li><strong>Beat:</strong> ${data.beat_title}</li>
    <li><strong>Amount:</strong> ${data.amount}</li>
    <li><strong>Buyer:</strong> ${data.buyer_email}</li>
  </ul>
  <p><a href="${data.dashboard_url}">View in Dashboard →</a></p>
</body>
</html>
    `,
  }),
}
