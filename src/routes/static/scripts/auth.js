if (!window.localStorage.access_token) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.replace(`${window.location.origin}/login`)
} else {
    check();
}

async function check() {
    const res = await fetch(`${window.location.origin}/validateToken`, {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${localStorage.access_token}`
        }
    })
    
    const parsed = await res.json()
    if (!parsed.success) {

        const refreshRes = await fetch(`${window.location.origin}/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token: localStorage.refresh_token })
        })
        const parsedRefresh = await refreshRes.json()
        
        if (parsedRefresh.success) {
            localStorage.setItem('access_token', parsedRefresh.accessToken)
        } else {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.replace(`${window.location.origin}/login`)
        } 
    }
}
