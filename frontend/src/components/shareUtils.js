import { createShareLink } from '../api/diveApi'

const copyToClipboardFallback = (text) => {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.top = '-9999px'
  textarea.style.left = '-9999px'
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
}

export const shareDive = async (dive) => {
  console.log('Share button clicked for dive:', dive)
  
  if (!dive || !dive.id) {
    alert('Please save the dive first before sharing')
    return
  }
  
  try {
    console.log('Creating share link for dive ID:', dive.id)
    const shareData = await createShareLink(dive.id)
    console.log('Share API response:', shareData)
    
    const shareUrl = shareData.shareUrl
    if (!shareUrl) {
      throw new Error('No share URL returned from server')
    }
    
    const shareText = `🤿 Check out my dive log: ${dive.diveTitle || 'Dive'} at ${dive.location || 'unknown location'}! Depth: ${dive.depthMeters || '?'}m, Duration: ${dive.durationMinutes || '?'}min`
    const fullMessage = `${shareText}\n\nView online: ${shareUrl}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${dive.diveTitle || 'Dive'} - Tauche Log`,
          text: shareText,
          url: shareUrl
        })
        return
      } catch (shareErr) {
        console.log('Native share cancelled or failed:', shareErr)
      }
    }
    
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fullMessage)
      } else {
        copyToClipboardFallback(fullMessage)
      }
      alert('Share link copied to clipboard!\n\n' + shareUrl)
    } catch (clipErr) {
      console.error('Clipboard failed:', clipErr)
      alert('Copy this link to share:\n\n' + shareUrl)
    }
  } catch (err) {
    console.error('Share failed:', err)
    alert('Failed to create share link: ' + (err.response?.data?.message || err.message || 'Please try again'))
  }
}