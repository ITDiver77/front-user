import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'
import { server, resetCapturedRequests, getCapturedRequests } from '../../test/msw/handlers'
import { serverService } from '../../services/serverService'

// Mock import.meta.env for axios
vi.stubGlobal('importMeta', {
  env: { VITE_API_BASE_URL: 'http://localhost:8000/api/v1' }
})

describe('serverService', () => {
  beforeAll(() => server.listen())
  afterAll(() => server.close())
  beforeEach(() => {
    resetCapturedRequests()
  })

  describe('getActiveServers', () => {
    it('should fetch list of active servers', async () => {
      const servers = await serverService.getActiveServers()

      expect(servers).toHaveLength(2)
      expect(servers[0].name).toBe('US-West')
      expect(servers[1].name).toBe('EU-Central')
      servers.forEach(server => {
        expect(server.is_active).toBe(true)
      })
    })

    it('should include region and other server details', async () => {
      const servers = await serverService.getActiveServers()

      expect(servers[0].region).toBe('US')
      expect(servers[0].host).toBe('us.example.com')
      expect(servers[0].port).toBe(51820)
      expect(servers[0].is_default).toBe(true)
    })
  })

  describe('getServer', () => {
    it('should fetch server by name', async () => {
      const server = await serverService.getServer('US-West')

      expect(server.name).toBe('US-West')
      expect(server.region).toBe('US')
    })

    it('should throw error for non-existent server', async () => {
      await expect(serverService.getServer('NonExistent')).rejects.toThrow()
    })
  })
})
