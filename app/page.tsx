"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import QRCode from 'qrcode'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'

export default function Home() {
  const [copied, setCopied] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  
  const waNumber = process.env.NEXT_PUBLIC_WA_NUMBER_E164 ?? '+19095290130'
  const waKeyword = process.env.NEXT_PUBLIC_WA_KEYWORD ?? 'JOIN'
  const whatsappUrl = waNumber ? `https://wa.me/${waNumber.replace(/\D/g, '')}?text=${encodeURIComponent(waKeyword)}` : ''

  // Generate QR code on mount
  useEffect(() => {
    if (whatsappUrl) {
      QRCode.toDataURL(whatsappUrl, { width: 200, margin: 2 })
        .then(setQrCodeUrl)
        .catch(console.error)
    }
  }, [whatsappUrl])
  
  if (!waNumber) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Configuration Error</h1>
          <p className="text-red-600">WhatsApp number must be configured in environment variables</p>
        </div>
      </div>
    )
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(whatsappUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl">Join the Waitlist</CardTitle>
          <CardDescription>Message us on WhatsApp with the keyword below</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            {qrCodeUrl && (
              <div className="flex justify-center mb-6">
                <Image
                  src={qrCodeUrl}
                  alt="WhatsApp QR Code"
                  width={200}
                  height={200}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg"
                />
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button variant="neumorphic-primary" className="w-full h-12">
                Open WhatsApp
              </Button>
            </a>
            
            <Button
              variant="neumorphic-secondary"
              onClick={copyToClipboard}
              className="sm:w-auto h-12"
            >
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed text-center">
            By messaging, you agree we may contact you later on WhatsApp/SMS. 
            Msg & data rates may apply.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}