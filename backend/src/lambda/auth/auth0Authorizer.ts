import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
// import Axios from 'axios'

import { JwtPayload } from '../../auth/JwtPayload'
// import { Jwt } from '../../auth/Jwt'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
// const jwksUrl = 'https://fudap-domain.auth0.com/.well-known/jwks.json'
let cert =  `-----BEGIN CERTIFICATE-----
MIIDBzCCAe+gAwIBAgIJTrS9Lrh/mG5ZMA0GCSqGSIb3DQEBCwUAMCExHzAdBgNV
BAMTFmZ1ZGFwLWRvbWFpbi5hdXRoMC5jb20wHhcNMjAwNDA4MTU1NzMxWhcNMzMx
MjE2MTU1NzMxWjAhMR8wHQYDVQQDExZmdWRhcC1kb21haW4uYXV0aDAuY29tMIIB
IjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAm30NnrYHEZlwaWTMrJjBSzcy
i4bWOvKRFNip/32I37P+KvbFgMER/1PVLH6Tn1T0d4OwJ01yE8hcFXAk8VK772Xe
7wet93ojlom22AB0iFIUq+zldOVvGr7ckdKaanPYOrr9ZKzPqDXXo3jSnw8zMm9B
nbMLTsZH8i4lTr7kdvPPhmat56XyBBg4Q85VjNu3wW6jyYxiTO2ONLnVnsZ1mfWL
00oWUuS1pow1tVuOpr3XnUNprEp3VaFiI7vH6HrqGWdaLBKjF9oZ0W0X7e5whbVq
5dAc07/bt3jDypjeVhhmw88VaYsAU2sCPVxmG0EtthtLq6p73TzH0kIVlZuYbQID
AQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBSjqaTn/P8idA+24nfL
nYefekP9ETAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEBAABE1Ywr
5YNjDnTCU0K2n8VokdktF2cV7gM/InpbEvXAOIV90XQ6F1gcpfXwySiStjoDOiDb
tGYHEIOFocJSNG2EOdkzBUJnWn71IgPtx035jZWBfiKYloK2sudAtLJbF+YvPlW+
kXN9oMeuh8/cYVmMtdayiBPITW+BpqWiJ10clAY2mGrAKGA6t2UrcJJlp6zPfOEY
mxzYWubHF9ip/1ut+5h4lly1vzdLyWJafwXo6bywNpd4aOnFACksc1m8h+PBeHlv
1OjRKlrQ0zZvOv0F5QBfAEPi/eaVrSMkbrNg6Pt0GGr+LmZHKtizXTifbjLHfRFd
Vo5yUq8JHFBHN9U=
-----END CERTIFICATE-----`

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)


  
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  //  const jwt: Jwt = decode(token, { complete: true }) as Jwt
  //   var decodedToken = decode(token, {complete: true}) as Jwt;
  //   if (decodedToken.header.alg !== 'RS256') {
  //     throw new Error('Invalid algorithm ')

  //   }

    

  // let res = await Axios.get(jwksUrl)
  // let cert = res.data

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/

  return verify(token, cert,{ algorithms: ['RS256'] }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}


