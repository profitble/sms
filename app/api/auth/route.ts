import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, role, password } = body
    
    // Handle login
    if (action === 'login') {
      let isValid = false
      let sessionCookie = ''
      
      switch (role) {
        case 'admin':
          isValid = password === 'max' // MVP simple check
          sessionCookie = 'admin_session'
          break
        case 'assistant':
          isValid = password === process.env.ASSIST_PASSWORD
          sessionCookie = 'assistant_session'
          break
        case 'max':
          isValid = password === process.env.MAX_PASSWORD
          sessionCookie = 'max_session'
          break
        default:
          return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
      }
      
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
      }
      
      // Set the appropriate session cookie
      const response = NextResponse.json({ success: true })
      response.cookies.set(sessionCookie, '1', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/'
      })
      
      return response
    }
    
    // Handle logout
    if (action === 'logout') {
      const response = NextResponse.json({ success: true })
      
      // Clear all possible session cookies
      const sessionCookies = ['admin_session', 'assistant_session', 'max_session']
      sessionCookies.forEach(cookieName => {
        response.cookies.delete(cookieName)
      })
      
      return response
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}