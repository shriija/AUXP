const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

async function testUpload() {
  try {
    // 1. Login to get a token
    console.log('Logging in...');
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'testuser@anurag.edu.in',
      password: 'Password123!'
    });
    const token = loginRes.data.token;
    console.log('Logged in successfully! Token obtained.');

    // 2. Fetch an approved forum post ID
    console.log('Fetching forum posts...');
    const forumRes = await axios.get('http://localhost:5000/api/forum', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const post = forumRes.data.find(p => p.approvalStatus === 'approved');
    if (!post) {
      throw new Error('No approved post found to reply to.');
    }
    const postId = post._id;
    console.log(`Found approved post ID: ${postId} (${post.title})`);

    // 3. Prepare form data with single file
    const formData = new FormData();
    formData.append('content', 'This is a test reply with a single image attachment.');
    
    const file1Path = path.join(__dirname, '..', '..', 'test_image1.png');
    
    if (fs.existsSync(file1Path)) {
      formData.append('image', fs.createReadStream(file1Path));
      console.log('Appended test_image1.png as single image');
    } else {
      console.log('test_image1.png not found at ' + file1Path);
    }

    // 4. Send the POST request to add reply
    console.log('Sending post reply request...');
    const replyRes = await axios.post(`http://localhost:5000/api/forum/${postId}/replies`, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });

    console.log('Success! Reply created:');
    console.log(JSON.stringify(replyRes.data, null, 2));

  } catch (error) {
    console.error('Upload failed with error:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

testUpload();
