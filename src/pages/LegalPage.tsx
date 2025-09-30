import { Layout } from "@/components/Layout";
import { useParams } from "react-router-dom";

const LegalPage = () => {
  const { type } = useParams<{ type: string }>();

  const getTitle = () => {
    switch (type) {
      case 'mentions-legales':
        return 'Mentions légales';
      case 'politique-confidentialite':
        return 'Politique de confidentialité';
      case 'conditions-generales':
        return 'Conditions Générales d\'Utilisation';
      default:
        return 'Informations légales';
    }
  };

  const getContent = () => {
    switch (type) {
      case 'mentions-legales':
        return (
          <div className="prose max-w-none">
            <p className="mb-6">
              Conformément à la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique, 
              il est obligatoire de communiquer les informations suivantes :
            </p>

            <h2 className="text-2xl font-semibold mb-4">Éditeur du site</h2>
            <div className="mb-6">
              <p><strong>Nom de la société :</strong> SOPTIMA</p>
              <p><strong>Forme juridique :</strong> SAS</p>
              <p><strong>Capital social :</strong> 3000 €</p>
              <p><strong>Adresse du siège social :</strong> 1 Passage des Acacias 75017 Paris</p>
              <p><strong>Numéro SIRET :</strong> 93494990000013</p>
              <p><strong>Numéro de TVA intracommunautaire :</strong> FR40934949900</p>
              <p><strong>Email :</strong> legal@soptima.fr</p>
            </div>

            <h2 className="text-2xl font-semibold mb-4">Directeur de la publication</h2>
            <p className="mb-6">Fabien SORANZO, Directeur Général</p>

            <h2 className="text-2xl font-semibold mb-4">Hébergement</h2>
            <p className="mb-2">Le site est hébergé par :</p>
            <div className="mb-6">
              <p>Amazon Web Services EMEA SARL</p>
              <p><strong>Adresse :</strong> 5 rue Plaetis L-2338 Luxembourg</p>
              <p><strong>Fax :</strong> 352 2789 0057</p>
              <p><a href="https://aws.amazon.com" className="text-soptima-600 hover:text-soptima-700 underline" target="_blank" rel="noopener noreferrer">https://aws.amazon.com</a></p>
            </div>
          </div>
        );
      case 'politique-confidentialite':
        return (
          <div className="prose max-w-none">
            <p className="mb-4 text-sm text-gray-600">
              Dernière mise à jour : 26 juin 2025
            </p>

            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="mb-6">
              Nous attachons une grande importance à la protection de vos données personnelles et au respect de votre vie privée. 
              La présente Politique de Confidentialité a pour objectif de vous informer de manière claire et transparente sur la 
              manière dont nous collectons et traitons vos données personnelles dans le cadre de l'utilisation de notre service.
            </p>

            <h2 className="text-2xl font-semibold mb-4">2. Données collectées</h2>
            <p className="mb-4">
              Dans le cadre de l'utilisation de notre service, seules les données relatives à vos identifiants d'accès 
              (adresse e-mail et mot de passe chiffré) sont collectées et conservées, dans le but exclusif de vous permettre 
              de créer un compte, de vous identifier et d'accéder à votre espace personnel.
            </p>
            <p className="mb-4">
              Aucune autre donnée personnelle ou fichier transmis via notre service n'est sauvegardé ou conservé.
            </p>
            <p className="mb-6">
              Par ailleurs, les données traitées par nos algorithmes sont utilisées uniquement pendant le temps d'exécution du 
              traitement, et ne sont ni stockées ni conservées après la fin du traitement. Elles sont automatiquement supprimées 
              dès l'achèvement du processus.
            </p>

            <h2 className="text-2xl font-semibold mb-4">3. Finalités du traitement</h2>
            <p className="mb-2">Les données collectées sont utilisées aux fins suivantes :</p>
            <ul className="list-disc list-inside mb-4">
              <li>Création et gestion de votre compte utilisateur</li>
              <li>Sécurisation de l'accès à votre compte</li>
              <li>Gestion de la relation utilisateur</li>
            </ul>
            <p className="mb-6">
              Aucune donnée n'est utilisée à des fins commerciales ou de prospection sans votre consentement explicite.
            </p>

            <h2 className="text-2xl font-semibold mb-4">4. Durée de conservation</h2>
            <p className="mb-4">
              Vos données d'identification sont conservées aussi longtemps que votre compte est actif. 
              Elles sont supprimées immédiatement en cas de suppression de compte à votre demande.
            </p>
            <p className="mb-6">
              Les données traitées par nos algorithmes sont temporairement utilisées le temps de l'exécution du traitement, 
              puis immédiatement détruites.
            </p>

            <h2 className="text-2xl font-semibold mb-4">5. Sécurité des données</h2>
            <p className="mb-6">
              Nous mettons en œuvre toutes les mesures techniques et organisationnelles appropriées pour garantir la sécurité 
              de vos données d'identification et empêcher tout accès non autorisé, altération, divulgation ou destruction.
            </p>

            <h2 className="text-2xl font-semibold mb-4">6. Partage des données</h2>
            <p className="mb-4">
              Vos données personnelles ne sont jamais vendues ni cédées à des tiers.
            </p>
            <p className="mb-6">
              Elles ne sont accessibles qu'aux personnes habilitées au sein de notre entreprise et à nos prestataires 
              techniques strictement pour les besoins de l'hébergement et du fonctionnement du service.
            </p>

            <h2 className="text-2xl font-semibold mb-4">7. Droits des utilisateurs</h2>
            <p className="mb-2">
              Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants 
              concernant vos données personnelles :
            </p>
            <ul className="list-disc list-inside mb-4">
              <li>Droit d'accès</li>
              <li>Droit de rectification</li>
              <li>Droit à l'effacement (droit à l'oubli)</li>
              <li>Droit à la limitation du traitement</li>
              <li>Droit d'opposition</li>
              <li>Droit à la portabilité</li>
            </ul>
            <p className="mb-6">
              Pour exercer ces droits, vous pouvez nous contacter à l'adresse suivante : 
              <a href="mailto:legal@soptima.fr" className="text-soptima-600 hover:text-soptima-700 underline ml-1">
                legal@soptima.fr
              </a>.
            </p>

            <h2 className="text-2xl font-semibold mb-4">8. Modifications de la Politique de Confidentialité</h2>
            <p className="mb-6">
              Nous nous réservons le droit de modifier la présente Politique de Confidentialité à tout moment. 
              Toute modification sera publiée sur cette page et, le cas échéant, vous sera notifiée par e-mail.
            </p>
          </div>
        );
      case 'conditions-generales':
        return (
          <div className="prose max-w-none">
            <p className="mb-4 text-sm text-gray-600">
              Dernière mise à jour : 26 juin 2025
            </p>

            <h2 className="text-2xl font-semibold mb-4">1. Objet</h2>
            <p className="mb-4">
              Les présentes Conditions Générales d'Utilisation (ci-après les « CGU ») définissent les modalités et conditions 
              d'utilisation de la plateforme SaaS de retraitement de fichiers proposée par SOPTIMA SAS (ci-après « Soptima »), 
              accessible via une URL dédiée et sécurisée.
            </p>
            <p className="mb-4">
              La plateforme permet aux utilisateurs (ci-après les « Utilisateurs » ou le « Client ») de retraiter des données 
              provenant de fichiers sources et de fichiers cibles afin de produire un fichier final structuré à importer dans 
              leur outil de gestion (ex : PayFit).
            </p>
            <p className="mb-6">
              En utilisant la plateforme, l'Utilisateur reconnaît avoir lu, compris et accepté les présentes CGU dans leur intégralité.
            </p>

            <h2 className="text-2xl font-semibold mb-4">2. Description du Service</h2>
            <p className="mb-2">Le service permet à l'Utilisateur :</p>
            <ul className="list-disc list-inside mb-4">
              <li>d'importer un ou plusieurs fichiers sources (issus de son propre environnement SIRH/ERP ou d'autres solutions),</li>
              <li>d'importer un fichier cible (ex : export issu de PayFit),</li>
              <li>de lancer un traitement automatisé qui restructure les données du fichier source pour les intégrer au format du fichier cible,</li>
              <li>et de récupérer un fichier retraité via un lien de téléchargement sécurisé.</li>
            </ul>
            <p className="mb-6">
              Ce service est fourni « en l'état », sans vérification du contenu, de la qualité ou de la conformité des données 
              transmises ou retraitées.
            </p>

            <h2 className="text-2xl font-semibold mb-4">3. Responsabilités de Soptima</h2>
            <h3 className="text-xl font-semibold mb-3">3.1 Limite de responsabilité</h3>
            <p className="mb-4">
              Soptima agit en qualité de prestataire technique assurant uniquement le traitement automatisé et l'ajustement des 
              données entre un fichier source et un fichier cible.
            </p>
            <p className="mb-2">En aucun cas, Soptima n'intervient dans :</p>
            <ul className="list-disc list-inside mb-4">
              <li>la vérification de la conformité ou de l'exactitude des données contenues dans les fichiers source et cible,</li>
              <li>la validation ou l'utilisation du fichier retraité dans les solutions clientes (ex : PayFit),</li>
              <li>l'interprétation ou l'exploitation des résultats par l'Utilisateur.</li>
            </ul>
            <p className="mb-2">L'Utilisateur reste seul responsable :</p>
            <ul className="list-disc list-inside mb-4">
              <li>des fichiers qu'il importe,</li>
              <li>de l'utilisation du fichier retraité, notamment de son import dans toute solution tierce.</li>
            </ul>
            <p className="mb-6">
              Soptima ne pourra être tenu responsable des conséquences directes ou indirectes liées à des erreurs, omissions ou 
              inexactitudes dans les données fournies ou issues du retraitement.
            </p>

            <h3 className="text-xl font-semibold mb-3">3.2 Disponibilité du Service</h3>
            <p className="mb-4">
              Soptima s'efforcera de maintenir la disponibilité continue du service, sous réserve d'opérations de maintenance, de 
              mises à jour ou de circonstances exceptionnelles indépendantes de sa volonté (force majeure, incidents réseau, etc.).
            </p>
            <p className="mb-6">Aucune garantie de disponibilité ininterrompue n'est donnée.</p>

            <h2 className="text-2xl font-semibold mb-4">4. Obligations de l'Utilisateur</h2>
            <p className="mb-2">L'Utilisateur s'engage à :</p>
            <ul className="list-disc list-inside mb-4">
              <li>utiliser la plateforme exclusivement à des fins professionnelles,</li>
              <li>s'assurer de la validité et de la conformité légale des données qu'il transmet,</li>
              <li>sauvegarder ses données avant toute utilisation du service,</li>
              <li>vérifier la conformité du fichier retraité avant son exploitation.</li>
            </ul>
            <p className="mb-6">
              L'Utilisateur déclare disposer de toutes les autorisations nécessaires pour l'utilisation des données traitées.
            </p>

            <h2 className="text-2xl font-semibold mb-4">5. Sécurité et Confidentialité</h2>
            <p className="mb-4">
              Les fichiers transmis et retraités via la plateforme sont hébergés dans un environnement cloud sécurisé, opéré par 
              Soptima, selon les standards de sécurité en vigueur.
            </p>
            <p className="mb-2">Soptima s'engage à :</p>
            <ul className="list-disc list-inside mb-4">
              <li>assurer la confidentialité des fichiers et données transmises et retraitées,</li>
              <li>ne pas conserver les fichiers plus de 3 heures après traitement et mise à disposition du lien de téléchargement.</li>
            </ul>
            <p className="mb-6">
              L'Utilisateur reste seul responsable de la gestion et du stockage de ses fichiers sources et retraités.
            </p>

            <h2 className="text-2xl font-semibold mb-4">6. Propriété Intellectuelle</h2>
            <p className="mb-4">
              Soptima conserve la pleine propriété intellectuelle de la plateforme, de son interface et de ses algorithmes de traitement.
            </p>
            <p className="mb-6">
              Aucun droit de propriété ou d'utilisation autre que celui décrit dans les présentes CGU n'est accordé à l'Utilisateur.
            </p>

            <h2 className="text-2xl font-semibold mb-4">7. Modification des CGU</h2>
            <p className="mb-4">
              Soptima se réserve le droit de modifier à tout moment les présentes CGU.
            </p>
            <p className="mb-6">
              L'Utilisateur sera informé en cas de modification substantielle. L'utilisation continue de la plateforme après 
              notification vaut acceptation des nouvelles conditions.
            </p>

            <h2 className="text-2xl font-semibold mb-4">8. Loi applicable et juridiction compétente</h2>
            <p className="mb-4">Les présentes CGU sont régies par le droit français.</p>
            <p className="mb-6">
              Tout litige relatif à leur interprétation ou exécution sera soumis à la compétence exclusive des tribunaux du 
              ressort de Paris.
            </p>

            <h2 className="text-2xl font-semibold mb-4">9. Contact</h2>
            <p className="mb-2">
              Pour toute question relative aux présentes CGU ou à l'utilisation de la plateforme, l'Utilisateur peut contacter :
            </p>
            <div className="mb-6">
              <p><strong>SOPTIMA SAS</strong></p>
              <p><strong>Adresse :</strong> 1 passage des Acacias 75017 Paris</p>
              <p><strong>Email :</strong> 
                <a href="mailto:legal@soptima.fr" className="text-soptima-600 hover:text-soptima-700 underline ml-1">
                  legal@soptima.fr
                </a>
              </p>
            </div>
          </div>
        );
      default:
        return (
          <div className="prose max-w-none">
            <p>Page non trouvée.</p>
          </div>
        );
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">{getTitle()}</h1>
          {getContent()}
        </div>
      </div>
    </Layout>
  );
};

export default LegalPage;
