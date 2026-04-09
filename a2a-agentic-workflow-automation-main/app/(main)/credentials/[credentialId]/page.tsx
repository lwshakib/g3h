import React from 'react'

export default async function page({params}: {params: {credentialId: string}}) {
    const { credentialId } = await params;
  return (
    <div>/credentials/{credentialId}</div>
  )
}
