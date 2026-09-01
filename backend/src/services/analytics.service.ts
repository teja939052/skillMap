import { ObjectId } from 'mongodb';
import { getCollection } from '../config/database.js';

export const AnalyticsService = {
  async getDashboard(userId: string, role: string) {
    if (role === 'student') {
      return AnalyticsService.getStudentDashboard(userId);
    }
    if (role === 'institution_admin') {
      return AnalyticsService.getInstitutionDashboard(userId);
    }
    if (role === 'industry') {
      return AnalyticsService.getIndustryDashboard(userId);
    }
    return { role, message: 'Dashboard not implemented for this role' };
  },

  async getStudentDashboard(userId: string) {
    const evidenceCollection = getCollection('evidence');
    const evidence = await evidenceCollection.find({ ownerId: new ObjectId(userId), deletedAt: null }).toArray();

    const passportCollection = getCollection('competencies');
    const competencyIds = [...new Set(evidence.map((e) => e.competencyId.toString()))];
    const competencies = await passportCollection.find({ _id: { $in: competencyIds.map((id) => new ObjectId(id)) } }).toArray();

    const totalEvidence = evidence.length;
    const verifiedEvidence = evidence.filter((e) => e.verificationStatus === 'verified').length;
    const avgProficiency = evidence.length > 0
      ? Math.round((evidence.reduce((s, e) => s + e.proficiencyLevel, 0) / evidence.length) * 10) / 10
      : 0;

    const applicationsCollection = getCollection('applications');
    const applications = await applicationsCollection.find({ applicantId: new ObjectId(userId) }).toArray();

    const opportunitiesCollection = getCollection('opportunities');
    const matchedOpps = await opportunitiesCollection.countDocuments({ status: 'open', deletedAt: null });

    return {
      stats: {
        totalEvidence,
        verifiedEvidence,
        avgProficiency,
        applicationsSubmitted: applications.length,
        applicationsAccepted: applications.filter((a) => a.status === 'accepted').length,
        matchedOpportunities: matchedOpps,
      },
      competencyBreakdown: competencies.map((c) => ({
        name: c.name,
        level: Math.max(...evidence.filter((e) => e.competencyId.toString() === c._id.toString()).map((e) => e.proficiencyLevel), 0),
      })).sort((a, b) => b.level - a.level).slice(0, 8),
      recentActivity: evidence.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5).map((e) => ({
        type: 'evidence',
        title: e.title,
        date: e.createdAt,
      })),
    };
  },

  async getInstitutionDashboard(userId: string) {
    const membershipCollection = getCollection('memberships');
    const memberships = await membershipCollection.find({ userId: new ObjectId(userId) }).toArray();
    const orgId = memberships[0]?.organizationId;

    if (!orgId) return { stats: {}, message: 'No organization found' };

    const usersCollection = getCollection('users');
    const totalStudents = await usersCollection.countDocuments({ role: 'student' });

    const evidenceCollection = getCollection('evidence');
    const totalEvidence = await evidenceCollection.countDocuments({ verificationStatus: 'verified' });

    const opportunitiesCollection = getCollection('opportunities');
    const activeOpps = await opportunitiesCollection.countDocuments({ status: 'open', deletedAt: null });

    const interventionsCollection = getCollection('interventions');
    const activeInterventions = await interventionsCollection.countDocuments({
      organizationId: orgId,
      status: 'active',
      deletedAt: null,
    });

    return {
      stats: {
        totalStudents,
        totalEvidence,
        activeOpportunities: activeOpps,
        activeInterventions,
      },
      readinessTrend: [
        { month: 'Jan', score: 62 },
        { month: 'Feb', score: 65 },
        { month: 'Mar', score: 68 },
        { month: 'Apr', score: 72 },
        { month: 'May', score: 74 },
        { month: 'Jun', score: 78 },
      ],
      topSkills: [
        { name: 'Python', demand: 92, supply: 85 },
        { name: 'React', demand: 88, supply: 72 },
        { name: 'SQL', demand: 85, supply: 80 },
        { name: 'Docker', demand: 78, supply: 45 },
        { name: 'Cloud', demand: 75, supply: 40 },
      ],
    };
  },

  async getIndustryDashboard(userId: string) {
    const opportunitiesCollection = getCollection('opportunities');
    const applicationsCollection = getCollection('applications');

    const activeOpps = await opportunitiesCollection.countDocuments({ status: 'open', deletedAt: null });
    const totalApplications = await applicationsCollection.countDocuments({});

    return {
      stats: {
        activeOpportunities: activeOpps,
        totalApplications,
        avgMatchScore: 72,
        shortlistedCandidates: Math.floor(totalApplications * 0.15),
      },
      demandTrend: [
        { month: 'Jan', applications: 45 },
        { month: 'Feb', applications: 52 },
        { month: 'Mar', applications: 61 },
        { month: 'Apr', applications: 58 },
        { month: 'May', applications: 73 },
        { month: 'Jun', applications: 85 },
      ],
    };
  },

  async getHeatmap(orgId: string) {
    const evidenceCollection = getCollection('evidence');
    const competenciesCollection = getCollection('competencies');

    const competencies = await competenciesCollection.find({ deletedAt: null }).limit(20).toArray();
    const heatmap = await Promise.all(
      competencies.map(async (comp) => {
        const evidence = await evidenceCollection.find({
          competencyId: comp._id,
          verificationStatus: 'verified',
          deletedAt: null,
        }).toArray();

        const avgLevel = evidence.length > 0
          ? evidence.reduce((s, e) => s + e.proficiencyLevel, 0) / evidence.length
          : 0;

        return {
          competencyId: comp._id.toString(),
          name: comp.name,
          avgLevel: Math.round(avgLevel * 10) / 10,
          evidenceCount: evidence.length,
        };
      })
    );

    return heatmap.filter((h) => h.evidenceCount > 0);
  },
};
