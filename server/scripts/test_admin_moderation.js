const axios = require('axios');

async function testAdminModeration() {
  try {
    // 1. Login as Admin
    console.log('Logging in as Admin...');
    const adminLoginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@anurag.edu.in',
      password: 'Password123!'
    });
    const adminToken = adminLoginRes.data.token;
    console.log('Admin logged in successfully!');

    // 2. Login as Student
    console.log('Logging in as Student...');
    const studentLoginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'testuser@anurag.edu.in',
      password: 'Password123!'
    });
    const studentToken = studentLoginRes.data.token;
    console.log('Student logged in successfully!');

    // 3. Student creates a new forum post
    console.log('Student creating a new forum post...');
    const createPostRes = await axios.post('http://localhost:5000/api/forum', {
      title: 'Admin Deletion Test Post ' + Date.now(),
      description: 'This is a test post that will be deleted and appealed.',
      tags: ['test', 'admin']
    }, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const postId = createPostRes.data._id;
    console.log(`Post created successfully! ID=${postId}`);

    // 4. Admin approves the post so it is active
    console.log('Admin approving the post...');
    await axios.post('http://localhost:5000/api/admin/approve', {
      itemId: postId,
      itemType: 'post'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('Post approved successfully.');

    // 5. Admin deletes the post with a reason
    console.log('Admin deleting the post...');
    const deleteReason = 'Test violation of guidelines';
    const deleteRes = await axios.post('http://localhost:5000/api/admin/delete-content', {
      itemId: postId,
      itemType: 'post',
      reason: deleteReason
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('Delete Response:', deleteRes.data.message);

    // 6. Verify the post is hidden from regular users
    console.log('Verifying post is hidden from student...');
    const forumResStudent = await axios.get('http://localhost:5000/api/forum', {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const foundPost = forumResStudent.data.find(p => p._id === postId);
    if (foundPost) {
      throw new Error('Post was deleted by admin but still returned to student!');
    }
    console.log('Verified: Post is hidden from student list.');

    // 7. Fetch student notifications to find deletion notification
    console.log('Fetching student notifications...');
    const notifRes = await axios.get('http://localhost:5000/api/notifications', {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const adminActionNotif = notifRes.data.find(n => n.type === 'ADMIN_ACTION' && n.relatedItem === postId);
    if (!adminActionNotif) {
      throw new Error('No ADMIN_ACTION notification found on student account!');
    }
    console.log('Found ADMIN_ACTION notification message:', adminActionNotif.message);

    // 8. Student raises an appeal concern
    console.log('Student raising appeal concern...');
    const appealRes = await axios.post('http://localhost:5000/api/concerns', {
      concernType: 'ADMIN_APPEAL',
      text: 'This post is educational and follows rules. Please restore.',
      contentType: 'post',
      contentId: postId
    }, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const concernId = appealRes.data.concern._id;
    console.log(`Appeal raised successfully! Concern ID: ${concernId}`);

    // 9. Admin fetches concerns to verify appeal concern is listed
    console.log('Admin fetching concerns...');
    const concernsRes = await axios.get('http://localhost:5000/api/concerns', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const foundConcern = concernsRes.data.concerns.find(c => c._id === concernId);
    if (!foundConcern) {
      throw new Error('Appeal concern was raised but not listed in admin concerns!');
    }
    console.log(`Verified: Concern type is ${foundConcern.concernType}, status is ${foundConcern.status}`);

    // 10. Admin reverts the action (restores the post and resolves the concern)
    console.log('Admin reverting deletion...');
    const revertRes = await axios.post('http://localhost:5000/api/admin/revert-content', {
      itemId: postId,
      itemType: 'post',
      concernId: concernId
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('Revert Response:', revertRes.data.message);

    // 11. Verify the post is visible to students again
    console.log('Verifying post is restored for student...');
    const forumResStudentAfter = await axios.get('http://localhost:5000/api/forum', {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const restoredPost = forumResStudentAfter.data.find(p => p._id === postId);
    if (!restoredPost) {
      throw new Error('Post was restored but not returned in student list!');
    }
    console.log(`Verified: Post "${restoredPost.title}" is visible again.`);

    // 12. Verify concern is resolved
    console.log('Admin verifying concern status...');
    const concernsResAfter = await axios.get('http://localhost:5000/api/concerns', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const resolvedConcern = concernsResAfter.data.concerns.find(c => c._id === concernId);
    if (resolvedConcern.status !== 'resolved') {
      throw new Error(`Concern status is ${resolvedConcern.status}, expected resolved!`);
    }
    console.log('Verified: Concern status is resolved.');

    // 13. Verify student received restoration notification
    console.log('Fetching student notifications again...');
    const notifResAfter = await axios.get('http://localhost:5000/api/notifications', {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const restoreNotif = notifResAfter.data.find(n => n.type === 'ADMIN_ACTION' && n.message.includes('restored'));
    if (!restoreNotif) {
      throw new Error('No ADMIN_ACTION restoration notification found on student account!');
    }
    console.log('Found restoration notification message:', restoreNotif.message);

    console.log('=== ALL ADMIN MODERATION BACKEND TESTS PASSED SUCCESSFULLY! ===');
  } catch (error) {
    console.error('Test failed with error:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

testAdminModeration();
