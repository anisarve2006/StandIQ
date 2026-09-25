import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { SectionHeader } from '../../components/layout/SectionHeader';
import { StandardCard, RelationshipItem } from '../../components/product/Standards';
import { VerificationStatus } from '../../components/product/Evidence';
import { FindingRow } from '../../components/product/Tender';
import { Mono, Meta } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { DataList } from '../../components/ui/DataList';
import { mockBasketStandards, mockBasketRelationships, mockVerificationGaps } from './basket.data';

export default function StandardsBasketPage() {
  const navigate = useNavigate();
  const [standards, setStandards] = useState(mockBasketStandards);
  const [relationships, setRelationships] = useState(mockBasketRelationships);

  const handleRemoveStandard = (id: string) => {
    setStandards(standards.filter(s => s.id !== id));
  };

  const handleRemoveRelationship = (id: string) => {
    setRelationships(relationships.filter(r => r.id !== id));
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="STANDARDS BASKET"
        title="SELECTED STANDARD SET"
        description="Review the standards and allied references that will form the basis of the procurement specification."
      />
      <div className="flex gap-4 items-center mb-12 flex-wrap">
        <Meta>DISCOVERED</Meta>
        <Mono className="text-sm">07</Mono>
        <span className="text-border">|</span>
        <Meta>SELECTED</Meta>
        <Mono className="text-sm">{standards.length}</Mono>
        <span className="text-border">|</span>
        <Meta>VERIFIED</Meta>
        <Mono className="text-sm">{standards.filter(s => s.verificationStatus === 'VERIFIED').length}</Mono>
      </div>

      <div className="flex flex-col gap-12 pb-24">
        
        {/* BASKET ITEMS */}
        <section className="flex flex-col gap-6">
          <SectionHeader number="01" title="SELECTED STANDARDS" />
          <div className="flex flex-col gap-6">
            {standards.map(std => (
              <div key={std.id} className="relative">
                <StandardCard 
                  id={std.id}
                  year={std.year}
                  status={std.status}
                  title={std.title}
                  type={std.type}
                  relevance={{ level: 'HIGH', score: 1.0 }} 
                />
                <div className="absolute top-0 right-0 h-full flex flex-col md:flex-row items-end md:items-center justify-end p-4 gap-6 bg-surface md:bg-transparent pointer-events-none">
                  <div className="flex flex-col gap-1 pointer-events-auto items-end md:items-start bg-surface p-2 rounded-sm border md:border-0 border-border">
                    <Meta>VERIFICATION</Meta>
                    <VerificationStatus status={std.verificationStatus as any} />
                  </div>
                  <div className="flex flex-col gap-1 pointer-events-auto items-end md:items-start bg-surface p-2 rounded-sm border md:border-0 border-border">
                    <Meta>EVIDENCE</Meta>
                    <Mono className="text-sm font-medium">{std.evidenceCount} REFERENCES</Mono>
                  </div>
                  <Button variant="ghost" size="sm" className="pointer-events-auto text-red-500 hover:text-red-600 uppercase" onClick={() => handleRemoveStandard(std.id)}>
                    REMOVE
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ALLIED REFERENCES */}
        <section className="flex flex-col gap-6">
          <SectionHeader number="02" title="ALLIED REFERENCES" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relationships.map(rel => (
              <div key={rel.id} className="relative group">
                <RelationshipItem 
                  type={rel.type}
                  id={rel.id}
                  description={rel.description}
                />
                <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 px-2 py-1 h-auto" onClick={() => handleRemoveRelationship(rel.id)}>
                    REMOVE
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* BASKET SUMMARY */}
          <section className="flex flex-col gap-6">
            <SectionHeader number="03" title="BASKET SUMMARY" />
            <div className="p-6 border border-border bg-surface rounded-sm">
              <DataList 
                items={[
                  { label: 'PRIMARY STANDARDS', value: standards.filter(s => s.type.includes('PRIMARY')).length.toString().padStart(2, '0') },
                  { label: 'TEST METHODS', value: relationships.filter(r => r.type === 'TEST METHOD').length.toString().padStart(2, '0') },
                  { label: 'SAFETY', value: relationships.filter(r => r.type === 'SAFETY').length.toString().padStart(2, '0') },
                  { label: 'INSTALLATION', value: relationships.filter(r => r.type === 'INSTALLATION').length.toString().padStart(2, '0') },
                  { label: 'CERTIFICATION', value: '01' }
                ]}
              />
              <div className="mt-6 pt-6 border-t border-border flex justify-between items-center">
                <Meta>TOTAL REFERENCES</Meta>
                <Mono className="text-lg font-bold">12</Mono>
              </div>
            </div>
          </section>

          {/* VERIFICATION GAPS */}
          <section className="flex flex-col gap-6">
            <SectionHeader number="04" title="VERIFICATION GAPS" />
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-2">
                <Mono className="text-lg font-bold text-text-primary">{mockVerificationGaps.length.toString().padStart(2, '0')}</Mono>
                <Meta>STANDARDS REQUIRE REVIEW</Meta>
              </div>
              {mockVerificationGaps.map(gap => (
                <FindingRow 
                  key={gap.id}
                  status="REVIEW REQUIRED"
                  title={gap.standardId}
                  description={gap.description}
                />
              ))}
            </div>
          </section>
        </div>

        <div className="mt-8 flex justify-end">
          <Button onClick={() => navigate('/specification-builder')} size="lg" className="w-full sm:w-auto">
            CONTINUE TO SPECIFICATION BUILDER →
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
