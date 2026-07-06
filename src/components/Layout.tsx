import { useRouter } from 'next/router'
import Link from 'next/link'
import {
  Box, Drawer, List, ListItemButton, ListItemIcon,
  ListItemText, Typography, Divider,
} from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import SearchIcon from '@mui/icons-material/Search'
import DescriptionIcon from '@mui/icons-material/Description'
import WorkIcon from '@mui/icons-material/Work'
import LeaderboardIcon from '@mui/icons-material/Leaderboard'
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined'

const DRAWER_WIDTH = 240

const navItems = [
  { label: 'Dashboard', href: '/', icon: <HomeIcon fontSize="small" /> },
  { label: 'Screen Resumes', href: '/scanner', icon: <SearchIcon fontSize="small" /> },
  { label: 'Job Descriptions', href: '/job-descriptions', icon: <WorkIcon fontSize="small" /> },
  { label: 'Resumes', href: '/resumes', icon: <DescriptionIcon fontSize="small" /> },
  { label: 'Results', href: '/results', icon: <LeaderboardIcon fontSize="small" /> },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            bgcolor: '#1e293b',
            color: 'white',
            border: 'none',
          },
        }}
      >
        {/* Brand */}
        <Box sx={{ px: 2.5, py: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            p: 0.75, borderRadius: 1.5, bgcolor: 'primary.main',
            display: 'flex', alignItems: 'center',
          }}>
            <AssessmentOutlinedIcon sx={{ fontSize: 20, color: 'white' }} />
          </Box>
          <Box>
            <Typography variant="body1" fontWeight={800} letterSpacing={-0.5}
              sx={{ color: 'white', lineHeight: 1.2 }}>
              Resume
            </Typography>
            <Typography variant="body1" fontWeight={800} letterSpacing={-0.5}
              sx={{ color: 'primary.light', lineHeight: 1.2 }}>
              Screener
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

        <List sx={{ px: 1.5, pt: 1.5, flex: 1 }}>
          {navItems.map(({ label, href, icon }) => {
            const active = router.pathname === href
            return (
              <Link key={href} href={href} passHref legacyBehavior>
                <ListItemButton
                  component="a"
                  selected={active}
                  sx={{
                    borderRadius: 1.5,
                    mb: 0.25,
                    py: 1,
                    color: active ? 'white' : 'rgba(255,255,255,0.55)',
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'primary.dark' },
                    },
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.07)',
                      color: 'white',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 34 }}>
                    {icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={label}
                    primaryTypographyProps={{ fontSize: 13.5, fontWeight: active ? 600 : 400 }}
                  />
                </ListItemButton>
              </Link>
            )
          })}
        </List>

        <Box sx={{ px: 2.5, py: 2, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.25)' }}>
            © 2026 Neha Thakur. All rights reserved.
          </Typography>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default', overflow: 'auto' }}
      >
        {children}
      </Box>
    </Box>
  )
}