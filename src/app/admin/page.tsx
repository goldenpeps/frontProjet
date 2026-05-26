'use client';

import Link from 'next/link';
import { ProtectedRoute } from '@/components';
import { Navbar } from '@/components/Navbar';
import styles from './admin.module.css';

const adminSections = [
  {
    href: '/admin/utilisateurs',
    icon: '👥',
    title: 'Utilisateurs',
    desc: 'Gérer les comptes, rôles et accès',
    color: '#2eade4',
  },
  {
    href: '/admin/clients',
    icon: '🏠',
    title: 'Clients',
    desc: 'Gérer la base de clients',
    color: '#87A515',
  },
  {
    href: '/admin/interventions',
    icon: '📋',
    title: 'Interventions',
    desc: 'Planifier et suivre les interventions',
    color: '#f18d3e',
  },
  {
    href: '/admin/equipes-interventions',
    icon: '🧑‍🤝‍🧑',
    title: 'Equipes intervention',
    desc: 'Composer les equipes en selectionnant les utilisateurs',
    color: '#2eade4',
  },
  {
    href: '/admin/terrains',
    icon: '🌳',
    title: 'Terrains',
    desc: 'Gérer les terrains et leurs types', 
    color: '#418123',
  },
  {
    href: '/admin/types-terrains',
    icon: '🧩',
    title: 'Types de terrain',
    desc: 'Créer et gérer les types pour les terrains',
    color: '#418123',
  },
  {
    href: '/admin/historique-terrains',
    icon: '🗂️',
    title: 'Historique terrains',
    desc: 'Suivre ramassage et tonte par terrain',
    color: '#418123',
  },
  {
    href: '/admin/devis',
    icon: '💰',
    title: 'Devis',
    desc: 'Créer et suivre les devis',
    color: '#2eade4',
  },
  {
    href: '/admin/materiel',
    icon: '🔧',
    title: 'Matériel',
    desc: 'Inventaire et disponibilité du matériel',
    color: '#f18d3e',
  },
  {
    href: '/admin/types-materiels',
    icon: '🧰',
    title: 'Types de matériel',
    desc: 'Libellé et transportable (oui/non)',
    color: '#f18d3e',
  },
  {
    href: '/admin/prestations',
    icon: '📑',
    title: 'Types de prestation',
    desc: 'Configurer les prestations et tarifs',
    color: '#87A515',
  },
];

function AdminHubContent() {
  return (
    <>
      <Navbar />
      <div className={styles.hubContainer}>
        <div className={styles.hubHeader}>
          <h1 className={styles.hubTitle}>Panneau d&apos;Administration</h1>
          <p className={styles.hubSubtitle}>Sélectionnez une section à gérer</p>
        </div>

        <div className={styles.hubGrid}>
          {adminSections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className={styles.hubCard}
              style={{ borderLeftColor: section.color }}
            >
              <div className={styles.hubCardIcon}>{section.icon}</div>
              <div>
                <h2 className={styles.hubCardTitle}>{section.title}</h2>
                <p className={styles.hubCardDesc}>{section.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRoles={['ROLE_ADMIN']}>
      <AdminHubContent />
    </ProtectedRoute>
  );
}
