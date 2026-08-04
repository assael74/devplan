// src/features/hub/sharedProfile/videoEdit/VideoAttachDrawerBody.js

import React from 'react'

import VideoAttachFields from '../../../../ui/forms/videos/VideoAttachFields.js'

export default function VideoAttachDrawerBody(props) {
  return <VideoAttachFields {...props} onDraft={props.setDraft} />
}
